<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Dispute;
use App\Models\StoreTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DisputeController extends BaseCustomerController
{
    public function index(): Response
    {

        $disputes = Dispute::where('created_by', $this->customer->id)
            ->with([
                'transaction',
                'creator:id,username',
                'assignedTo:id,name'
            ])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('customer/Disputes/Index', [
            'disputes' => $disputes,
        ]);
    }

    public function create(): Response
    {

        // Get transactions that can be disputed (completed transactions from last 30 days)
        $disputableTransactions = StoreTransaction::where('buyer_id', $this->customer->id)
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->subDays(30))
            ->whereDoesntHave('disputes')
            ->with(['product:id,name', 'seller:id,username'])
            ->get();

        return Inertia::render('customer/Disputes/Create', [
            'disputableTransactions' => $disputableTransactions,
            'disputeReasons' => [
                'product_not_received' => 'Không nhận được sản phẩm',
                'product_not_as_described' => 'Sản phẩm không đúng mô tả',
                'product_damaged' => 'Sản phẩm bị hỏng hoặc lỗi',
                'seller_unresponsive' => 'Người bán không phản hồi',
                'unauthorized_transaction' => 'Giao dịch không được phép',
                'other' => 'Khác',
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {

        $validated = $request->validate([
            'transaction_id' => ['required', 'exists:store_transactions,id'],
            'reason' => ['required', 'in:product_not_received,product_not_as_described,product_damaged,seller_unresponsive,unauthorized_transaction,other'],
            'description' => ['required', 'string', 'max:2000'],
            'evidence_files' => ['nullable', 'array', 'max:5'],
            'evidence_files.*' => ['file', 'max:10240'], // 10MB per file
        ], [
            'transaction_id.required' => 'Mã giao dịch là bắt buộc.',
            'transaction_id.exists' => 'Giao dịch không tồn tại hoặc không hợp lệ.',
            'reason.required' => 'Lý do khiếu nại là bắt buộc.',
            'reason.in' => 'Lý do khiếu nại không hợp lệ. Vui lòng chọn một trong các lý do được liệt kê.',
            'description.required' => 'Mô tả chi tiết khiếu nại là bắt buộc.',
            'description.string' => 'Mô tả chi tiết khiếu nại phải là chuỗi ký tự.',
            'description.max' => 'Mô tả chi tiết khiếu nại không được vượt quá 2000 ký tự.',
            'evidence_files.array' => 'Tệp bằng chứng phải là một danh sách.',
            'evidence_files.max' => 'Bạn không thể tải lên quá 5 tệp bằng chứng.',
            'evidence_files.*.file' => 'Mỗi bằng chứng phải là một tệp hợp lệ.',
            'evidence_files.*.max' => 'Mỗi tệp bằng chứng không được vượt quá 10MB.',
        ]);

        // Verify transaction belongs to customer and is eligible for dispute
        $transaction = StoreTransaction::where('id', $validated['transaction_id'])
            ->where('buyer_id', $this->customer->id)
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->subDays(30))
            ->first();

        if (!$transaction) {
            return back()->withErrors(['transaction_id' => 'Giao dịch không hợp lệ hoặc không đủ điều kiện.']);
        }

        // Check if dispute already exists
        if (Dispute::where('transaction_id', $transaction->id)->exists()) {
            return back()->withErrors(['transaction_id' => 'Tranh chấp đã tồn tại cho giao dịch này.']);
        }

        // Handle evidence file uploads
        $evidenceFiles = [];
        if ($request->hasFile('evidence_files')) {
            foreach ($request->file('evidence_files') as $file) {
                $evidenceFiles[] = $file->store('dispute-evidence', 'local');
            }
        }

        $dispute = Dispute::create([
            'transaction_type' => 'store',
            'transaction_id' => $transaction->id,
            'created_by' => $this->customer->id,
            'reason' => $validated['description'], // Using description as reason
            'evidence' => !empty($evidenceFiles) ? $evidenceFiles : null,
            'status' => 'pending',
        ]);

        return redirect()->route('customer.disputes.show', $dispute)
            ->with('success', 'Tranh chấp đã được tạo thành công! Đội ngũ của chúng tôi sẽ xem xét trong vòng 24 giờ.');
    }

    public function show(Dispute $dispute): Response
    {

        // Check if user is participant in this dispute (only creator can view)
        if ($dispute->created_by !== $this->customer->id) {
            abort(403);
        }

        $dispute->load([
            'transaction',
            'creator:id,username',
            'assignedTo:id,name'
        ]);

        return Inertia::render('customer/Disputes/Show', [
            'dispute' => $dispute,
            'isCreator' => $dispute->created_by === $this->customer->id,
        ]);
    }

    public function respond(Request $request, Dispute $dispute): RedirectResponse
    {

        // Only creator can update their dispute in pending status
        if ($dispute->created_by !== $this->customer->id || !in_array($dispute->status, ['pending', 'processing'])) {
            abort(403);
        }

        $validated = $request->validate([
            'additional_info' => ['required', 'string', 'max:2000'],
            'evidence_files' => ['nullable', 'array', 'max:5'],
            'evidence_files.*' => ['file', 'max:10240'],
        ], [
            'additional_info.required' => 'Thông tin bổ sung là bắt buộc.',
            'additional_info.string' => 'Thông tin bổ sung phải là chuỗi ký tự.',
            'additional_info.max' => 'Thông tin bổ sung không được vượt quá 2000 ký tự.',
            'evidence_files.array' => 'Tệp bằng chứng phải là một danh sách.',
            'evidence_files.max' => 'Bạn không thể tải lên quá 5 tệp bằng chứng.',
            'evidence_files.*.file' => 'Mỗi bằng chứng phải là một tệp hợp lệ.',
            'evidence_files.*.max' => 'Mỗi tệp bằng chứng không được vượt quá 10MB.',
        ]);

        // Handle evidence file uploads
        $evidenceFiles = $dispute->evidence ?? [];
        if ($request->hasFile('evidence_files')) {
            foreach ($request->file('evidence_files') as $file) {
                $evidenceFiles[] = $file->store('dispute-evidence', 'local');
            }
        }

        $dispute->update([
            'reason' => $dispute->reason . "\n\nThông tin bổ sung: " . $validated['additional_info'],
            'evidence' => $evidenceFiles,
            'status' => 'processing',
        ]);

        return redirect()->route('customer.disputes.show', $dispute)
            ->with('success', 'Thông tin bổ sung đã được gửi thành công!');
    }
    public function downloadEvidence(Dispute $dispute, $fileIndex)
    {

        // Check if user is participant in this dispute
        if ($dispute->created_by !== $this->customer->id) {
            abort(403);
        }

        $files = $dispute->evidence ?? [];

        if (!isset($files[$fileIndex])) {
            abort(404, 'File not found.');
        }

        $filePath = $files[$fileIndex];

        if (!Storage::disk('local')->exists($filePath)) {
            abort(404, 'File not found.');
        }

        return response()->download(Storage::disk('local')->path($filePath));
    }

    public function cancel(Dispute $dispute): RedirectResponse
    {

        // Only creator can cancel, and only if dispute is still pending/processing
        if ($dispute->created_by !== $this->customer->id || !in_array($dispute->status, ['pending', 'processing'])) {
            abort(403);
        }

        $dispute->update([
            'status' => 'cancelled',
            'result' => 'refund_buyer',
            'resolved_at' => now(),
        ]);

        return redirect()->route('customer.disputes.index')
            ->with('success', 'Tranh chấp đã được hủy thành công.');
    }

    public function escalate(Dispute $dispute): RedirectResponse
    {

        // Only creator can escalate, and only if processing for more than 48 hours
        if ($dispute->created_by !== $this->customer->id) {
            abort(403);
        }

        if ($dispute->status !== 'processing' || $dispute->updated_at->diffInHours(now()) < 48) {
            return back()->withErrors(['message' => 'Tranh chấp chưa thể được nâng cấp. Vui lòng chờ 48 giờ.']);
        }

        $dispute->update([
            'status' => 'processing',
            'admin_notes' => ($dispute->admin_notes ?? '') . "\nEscalated by customer at: " . now(),
        ]);

        return redirect()->route('customer.disputes.show', $dispute)
            ->with('success', 'Tranh chấp đã được nâng cấp thành công. Nhân viên cấp cao sẽ xem xét.');
    }

    public function history(): Response
    {

        $disputes = Dispute::where('created_by', $this->customer->id)
            ->with([
                'transaction',
                'creator:id,username',
                'assignedTo:id,name'
            ])
            ->whereIn('status', ['resolved', 'cancelled'])
            ->orderBy('resolved_at', 'desc')
            ->paginate(20);

        return Inertia::render('customer/Disputes/History', [
            'disputes' => $disputes,
        ]);
    }

    public function guidelines(): Response
    {
        return Inertia::render('customer/Disputes/Guidelines', [
            'guidelines' => [
                'When to file a dispute' => [
                    'Không nhận được sản phẩm trong thời gian dự kiến',
                    'Sản phẩm khác biệt đáng kể so với mô tả',
                    'Sản phẩm bị hỏng hoặc lỗi',
                    'Người bán không phản hồi sau khi thanh toán',
                    'Giao dịch không được phép hoặc có dấu hiệu gian lận',
                ],
                'Evidence to provide' => [
                    'Ảnh chụp màn hình trang sản phẩm',
                    'Lịch sử trao đổi với người bán',
                    'Ảnh sản phẩm đã nhận (nếu có)',
                    'Bằng chứng thanh toán',
                    'Các tài liệu liên quan khác',
                ],
                'Resolution process' => [
                    '1. Tạo tranh chấp và gửi bằng chứng',
                    '2. Người bán có 48 giờ để phản hồi',
                    '3. Đội ngũ của chúng tôi sẽ xem xét vụ việc',
                    '4. Quyết định được đưa ra trong 5-7 ngày làm việc',
                    '5. Tiền sẽ được giải ngân hoặc hoàn lại tùy theo quyết định',
                ],
                'Important notes' => [
                    'Tranh chấp phải được tạo trong vòng 30 ngày kể từ ngày giao dịch',
                    'Cung cấp thông tin trung thực và chính xác',
                    'Tạo tranh chấp sai sự thật có thể dẫn đến khóa tài khoản',
                    'Quyết định của đội ngũ chúng tôi là cuối cùng',
                ],
            ],
        ]);
    }
}
