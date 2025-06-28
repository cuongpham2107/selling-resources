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

        $disputes = Dispute::where(function ($query) {
            $query->where('plaintiff_id', $this->customer->id)
                  ->orWhere('defendant_id', $this->customer->id);
        })
        ->with([
            'transaction.product:id,name',
            'plaintiff:id,username',
            'defendant:id,username',
            'resolvedBy:id,name'
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
                'product_not_received' => 'Product not received',
                'product_not_as_described' => 'Product not as described',
                'product_damaged' => 'Product damaged or defective',
                'seller_unresponsive' => 'Seller unresponsive',
                'unauthorized_transaction' => 'Unauthorized transaction',
                'other' => 'Other',
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
                $evidenceFiles[] = $file->store('dispute-evidence', 'private');
            }
        }

        $dispute = Dispute::create([
            'transaction_id' => $transaction->id,
            'plaintiff_id' => $this->customer->id,
            'defendant_id' => $transaction->seller_id,
            'reason' => $validated['reason'],
            'description' => $validated['description'],
            'evidence_files' => !empty($evidenceFiles) ? json_encode($evidenceFiles) : null,
            'status' => 'open',
        ]);

        return redirect()->route('customer.disputes.show', $dispute)
            ->with('success', 'Tranh chấp đã được tạo thành công! Đội ngũ của chúng tôi sẽ xem xét trong vòng 24 giờ.');
    }

    public function show(Dispute $dispute): Response
    {
        
        // Check if user is participant in this dispute
        if ($dispute->plaintiff_id !== $this->customer->id && $dispute->defendant_id !== $this->customer->id) {
            abort(403);
        }

        $dispute->load([
            'transaction.product:id,name,price',
            'plaintiff:id,username',
            'defendant:id,username',
            'resolvedBy:id,name'
        ]);

        return Inertia::render('customer/Disputes/Show', [
            'dispute' => $dispute,
            'isPlaintiff' => $dispute->plaintiff_id === $this->customer->id,
            'canRespond' => $dispute->status === 'open' && $dispute->defendant_id === $this->customer->id,
        ]);
    }

    public function respond(Request $request, Dispute $dispute): RedirectResponse
    {
    
        // Only defendant can respond
        if ($dispute->defendant_id !== $this->customer->id || $dispute->status !== 'open') {
            abort(403);
        }

        $validated = $request->validate([
            'response' => ['required', 'string', 'max:2000'],
            'evidence_files' => ['nullable', 'array', 'max:5'],
            'evidence_files.*' => ['file', 'max:10240'],
        ], [
            'response.required' => 'Phản hồi khiếu nại là bắt buộc.',
            'response.string' => 'Phản hồi khiếu nại phải là chuỗi ký tự.',
            'response.max' => 'Phản hồi khiếu nại không được vượt quá 2000 ký tự.',
            'evidence_files.array' => 'Tệp bằng chứng phải là một danh sách.',
            'evidence_files.max' => 'Bạn không thể tải lên quá 5 tệp bằng chứng.',
            'evidence_files.*.file' => 'Mỗi bằng chứng phải là một tệp hợp lệ.',
            'evidence_files.*.max' => 'Mỗi tệp bằng chứng không được vượt quá 10MB.',
        ]);

        // Handle evidence file uploads
        $evidenceFiles = [];
        if ($request->hasFile('evidence_files')) {
            foreach ($request->file('evidence_files') as $file) {
                $evidenceFiles[] = $file->store('dispute-evidence', 'private');
            }
        }

        $dispute->update([
            'defendant_response' => $validated['response'],
            'defendant_evidence' => !empty($evidenceFiles) ? json_encode($evidenceFiles) : null,
            'defendant_responded_at' => now(),
            'status' => 'under_review',
        ]);

        return redirect()->route('customer.disputes.show', $dispute)
            ->with('success', 'Phản hồi đã được gửi thành công! Tranh chấp hiện đang được xem xét.');
    }

    public function downloadEvidence(Dispute $dispute, $type, $fileIndex)
    {
        
        // Check if user is participant in this dispute
        if ($dispute->plaintiff_id !== $this->customer->id && $dispute->defendant_id !== $this->customer->id) {
            abort(403);
        }

        $files = [];
        if ($type === 'plaintiff') {
            $files = json_decode($dispute->evidence_files, true) ?? [];
        } elseif ($type === 'defendant') {
            $files = json_decode($dispute->defendant_evidence, true) ?? [];
        } else {
            abort(404);
        }

        if (!isset($files[$fileIndex])) {
            abort(404, 'File not found.');
        }

        $filePath = $files[$fileIndex];
        
        if (!Storage::disk('private')->exists($filePath)) {
            abort(404, 'File not found.');
        }

        return response()->download(Storage::disk('private')->path($filePath));
    }

    public function cancel(Dispute $dispute): RedirectResponse
    {
        
        // Only plaintiff can cancel, and only if dispute is still open
        if ($dispute->plaintiff_id !== $this->customer->id || !in_array($dispute->status, ['open', 'under_review'])) {
            abort(403);
        }

        $dispute->update([
            'status' => 'cancelled',
            'result' => 'cancelled_by_plaintiff',
            'resolved_at' => now(),
        ]);

        return redirect()->route('customer.disputes.index')
            ->with('success', 'Tranh chấp đã được hủy thành công.');
    }

    public function escalate(Dispute $dispute): RedirectResponse
    {
        
        // Only participants can escalate, and only if under review for more than 48 hours
        if (!in_array($this->customer->id, [$dispute->plaintiff_id, $dispute->defendant_id])) {
            abort(403);
        }

        if ($dispute->status !== 'under_review' || $dispute->updated_at->diffInHours(now()) < 48) {
            return back()->withErrors(['message' => 'Tranh chấp chưa thể được nâng cấp. Vui lòng chờ 48 giờ.']);
        }

        $dispute->update([
            'status' => 'escalated',
            'escalated_at' => now(),
        ]);

        return redirect()->route('customer.disputes.show', $dispute)
            ->with('success', 'Tranh chấp đã được nâng cấp thành công. Nhân viên cấp cao sẽ xem xét.');
    }

    public function history(): Response
    {

        $disputes = Dispute::where(function ($query) {
            $query->where('plaintiff_id', $this->customer->id)
                  ->orWhere('defendant_id', $this->customer->id);
        })
        ->with([
            'transaction.product:id,name',
            'plaintiff:id,username',
            'defendant:id,username'
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
                    'Product not received within expected timeframe',
                    'Product significantly different from description',
                    'Product damaged or defective',
                    'Seller becomes unresponsive after payment',
                    'Unauthorized or fraudulent transaction',
                ],
                'Evidence to provide' => [
                    'Screenshots of product listings',
                    'Communication with seller',
                    'Photos of received product (if applicable)',
                    'Proof of payment',
                    'Any other relevant documentation',
                ],
                'Resolution process' => [
                    '1. File dispute with evidence',
                    '2. Seller has 48 hours to respond',
                    '3. Our team reviews the case',
                    '4. Decision made within 5-7 business days',
                    '5. Funds released or refunded based on decision',
                ],
                'Important notes' => [
                    'Disputes must be filed within 30 days of transaction',
                    'Be honest and provide accurate information',
                    'False disputes may result in account suspension',
                    'Decision by our team is final',
                ],
            ],
        ]);
    }
}
