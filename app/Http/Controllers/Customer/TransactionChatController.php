<?php

namespace App\Http\Controllers\Customer;

use App\Models\TransactionChat;
use App\Models\StoreTransaction;
use App\Models\IntermediateTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TransactionChatController extends BaseCustomerController
{
    /**
     * Hiển thị danh sách giao dịch có thể chat
     */
    public function index(Request $request): Response
    {
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 10);
        $offset = ($page - 1) * $perPage;

        // Get unified transactions using Union Query
        $paginatedTransactions = $this->getUnifiedTransactions($offset, $perPage);
        
        return Inertia::render('customer/Chat/Transaction', [
            'transactions' => $paginatedTransactions,
        ]);
    }

    /**
     * Get unified transactions with proper pagination - SQLite Compatible Version
     */
    private function getUnifiedTransactions(int $offset, int $perPage): array
    {
        // Get store transactions
        $storeTransactions = StoreTransaction::where(function ($query) {
                $query->where('buyer_id', $this->customer->id)
                      ->orWhere('seller_id', $this->customer->id);
            })
            ->with(['product:id,name', 'buyer:id,username', 'seller:id,username'])
            ->whereIn('status', ['processing', 'completed', 'disputed'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'type' => 'store',
                    'created_at' => $transaction->created_at,
                    'updated_at' => $transaction->updated_at,
                    'status' => $transaction->status,
                    'amount' => $transaction->amount,
                    'buyer_id' => $transaction->buyer_id,
                    'seller_id' => $transaction->seller_id,
                    'buyer' => $transaction->buyer,
                    'seller' => $transaction->seller,
                    'product' => $transaction->product,
                    'description' => $transaction->product?->name ?? 'Sản phẩm không xác định',
                    'chat_url' => "/customer/chat/transaction/store/{$transaction->id}",
                ];
            });

        // Get intermediate transactions
        $intermediateTransactions = IntermediateTransaction::where(function ($query) {
                $query->where('buyer_id', $this->customer->id)
                      ->orWhere('seller_id', $this->customer->id);
            })
            ->with(['buyer:id,username', 'seller:id,username'])
            ->whereIn('status', ['pending', 'confirmed', 'seller_sent', 'buyer_received', 'completed', 'disputed'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'type' => 'intermediate',
                    'created_at' => $transaction->created_at,
                    'updated_at' => $transaction->updated_at,
                    'status' => $transaction->status,
                    'amount' => $transaction->amount,
                    'buyer_id' => $transaction->buyer_id,
                    'seller_id' => $transaction->seller_id,
                    'buyer' => $transaction->buyer,
                    'seller' => $transaction->seller,
                    'description' => $transaction->description ?? 'Giao dịch trung gian',
                    'chat_url' => "/customer/chat/transaction/intermediate/{$transaction->id}",
                ];
            });

        // Combine and sort all transactions
        $allTransactions = $storeTransactions->concat($intermediateTransactions)
            ->sortByDesc('created_at')
            ->values();

        $totalCount = $allTransactions->count();

        // Apply pagination
        $paginatedData = $allTransactions->slice($offset, $perPage)->values();

        // Calculate pagination metadata
        $currentPage = intval($offset / $perPage) + 1;
        $lastPage = intval(ceil($totalCount / $perPage));
        $from = $totalCount > 0 ? $offset + 1 : 0;
        $to = min($offset + $perPage, $totalCount);

        return [
            'data' => $paginatedData,
            'current_page' => $currentPage,
            'last_page' => $lastPage,
            'per_page' => $perPage,
            'total' => $totalCount,
            'from' => $from,
            'to' => $to,
            'first_page_url' => request()->url() . '?page=1',
            'last_page_url' => request()->url() . '?page=' . $lastPage,
            'next_page_url' => $currentPage < $lastPage ? request()->url() . '?page=' . ($currentPage + 1) : null,
            'prev_page_url' => $currentPage > 1 ? request()->url() . '?page=' . ($currentPage - 1) : null,
            'path' => request()->url(),
            'links' => $this->generatePaginationLinks($currentPage, $lastPage),
        ];
    }

    /**
     * Generate pagination links
     */
    private function generatePaginationLinks(int $currentPage, int $lastPage): array
    {
        $links = [];
        
        // Previous link
        $links[] = [
            'url' => $currentPage > 1 ? request()->url() . '?page=' . ($currentPage - 1) : null,
            'label' => '&laquo; Previous',
            'active' => false,
        ];

        // Page links
        $start = max(1, $currentPage - 2);
        $end = min($lastPage, $currentPage + 2);

        for ($i = $start; $i <= $end; $i++) {
            $links[] = [
                'url' => request()->url() . '?page=' . $i,
                'label' => (string) $i,
                'active' => $i === $currentPage,
            ];
        }

        // Next link
        $links[] = [
            'url' => $currentPage < $lastPage ? request()->url() . '?page=' . ($currentPage + 1) : null,
            'label' => 'Next &raquo;',
            'active' => false,
        ];

        return $links;
    }

    /**
     * Hiển thị chat cho giao dịch trung gian
     */
    public function showIntermediateTransaction(IntermediateTransaction $transaction): Response
    {
        // Check if user is participant in this transaction
        $this->checkIntermediateTransactionParticipant($transaction);

        $transaction->load([
            'buyer:id,username,email,phone,created_at',
            'seller:id,username,email,phone,created_at'
        ]);

        // Get transaction chat messages
        $chatMessages = TransactionChat::where('transaction_id', $transaction->id)
            ->where('transaction_type', 'intermediate')
            ->with('sender:id,username')
            ->orderBy('created_at', 'asc')
            ->get();
        
        // Determine other participant
        $otherParticipant = $this->getOtherParticipant($transaction);
        return Inertia::render('customer/Chat/TransactionShow', [
            'transaction' => $transaction,
            'chatMessages' => $chatMessages,
            'otherParticipant' => $otherParticipant,
            'currentUser' => $this->customer,
        ]);
    }

    /**
     * Hiển thị chat cho giao dịch cửa hàng
     */
    public function showStoreTransaction(StoreTransaction $transaction): Response
    {
        // Check if user is participant in this transaction
        if ($transaction->buyer_id !== $this->customer->id && $transaction->seller_id !== $this->customer->id) {
            abort(403, 'Bạn không có quyền truy cập cuộc trò chuyện này');
        }

        $transaction->load([
            'product:id,name',
            'buyer:id,username',
            'seller:id,username'
        ]);

        // Get transaction chat messages
        $chatMessages = TransactionChat::where('transaction_id', $transaction->id)
            ->where('transaction_type', 'store')
            ->with('sender:id,username')
            ->orderBy('created_at', 'asc')
            ->get();
       
        $otherParticipant = $transaction->buyer_id === $this->customer->id ? $transaction->seller : $transaction->buyer;
        

        return Inertia::render('customer/Chat/TransactionShow', [
            'transaction' => $transaction,
            'chatMessages' => $chatMessages,
            'otherParticipant' => $otherParticipant,
            'currentUser' => $this->customer,
        ]);
    }

    /**
     * Gửi tin nhắn cho giao dịch trung gian
     */
    public function sendIntermediateTransactionMessage(Request $request, IntermediateTransaction $transaction): RedirectResponse
    {
        // Check if user is participant in this transaction
        $this->checkIntermediateTransactionParticipant($transaction);

        $validated = $this->validateChatMessage($request);

        // Handle file uploads
        $imagePaths = $this->handleImageUploads($request);
        $fileData = $this->handleFileUploads($request);

        TransactionChat::create([
            'transaction_id' => $transaction->id,
            'transaction_type' => 'intermediate',
            'sender_id' => $this->customer->id,
            'message' => $validated['message'],
            'images' => !empty($imagePaths) ? $imagePaths : null,
            'files' => !empty($fileData) ? $fileData : null,
        ]);

        return back()->with('success', 'Tin nhắn đã được gửi thành công!');
    }

    /**
     * Gửi tin nhắn cho giao dịch cửa hàng
     */
    public function sendStoreTransactionMessage(Request $request, StoreTransaction $transaction): RedirectResponse
    {
        // Check if user is participant in this transaction
        if ($transaction->buyer_id !== $this->customer->id && $transaction->seller_id !== $this->customer->id) {
            abort(403, 'Bạn không có quyền gửi tin nhắn trong cuộc trò chuyện này');
        }

        $validated = $this->validateChatMessage($request);

        // Handle file uploads
        $imagePaths = $this->handleImageUploads($request);
        $fileData = $this->handleFileUploads($request);

        TransactionChat::create([
            'transaction_id' => $transaction->id,
            'transaction_type' => 'store',
            'sender_id' => $this->customer->id,
            'message' => $validated['message'],
            'images' => !empty($imagePaths) ? $imagePaths : null,
            'files' => !empty($fileData) ? $fileData : null,
        ]);

        return back()->with('success', 'Tin nhắn đã được gửi thành công!');
    }

    /**
     * Kiểm tra quyền tham gia giao dịch trung gian
     */
    private function checkIntermediateTransactionParticipant(IntermediateTransaction $transaction): void
    {
        $isParticipant = false;
        
        if ($transaction->buyer_id && $transaction->buyer_id === $this->customer->id) {
            $isParticipant = true;
        }
        if ($transaction->seller_id && $transaction->seller_id === $this->customer->id) {
            $isParticipant = true;
        }
        
        if (!$isParticipant) {
            abort(403, 'Bạn không có quyền truy cập cuộc trò chuyện này');
        }
    }

    /**
     * Lấy thông tin đối tác trong giao dịch
     */
    private function getOtherParticipant(IntermediateTransaction $transaction)
    {
        
        if ($transaction->buyer_id && $transaction->seller_id) {
            return $transaction->buyer_id === $this->customer->id ? $transaction->seller : $transaction->buyer;
        }
        return null;
    }

    /**
     * Validate tin nhắn chat với file uploads
     */
    private function validateChatMessage(Request $request): array
    {
        return $request->validate([
            'message' => ['required', 'string', 'max:1000'],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
            'files' => ['nullable', 'array', 'max:3'],
            'files.*' => ['file', 'mimes:pdf,doc,docx,txt,zip,rar', 'max:5120'],
        ], [
            'message.required' => 'Nội dung tin nhắn là bắt buộc.',
            'message.string' => 'Nội dung tin nhắn phải là chuỗi ký tự.',
            'message.max' => 'Nội dung tin nhắn không được vượt quá 1000 ký tự.',
            'images.max' => 'Chỉ được tải lên tối đa 5 hình ảnh.',
            'images.*.image' => 'File phải là hình ảnh.',
            'images.*.mimes' => 'Hình ảnh phải có định dạng: jpeg, png, jpg, gif.',
            'images.*.max' => 'Kích thước hình ảnh không được vượt quá 2MB.',
            'files.max' => 'Chỉ được tải lên tối đa 3 file.',
            'files.*.mimes' => 'File phải có định dạng: pdf, doc, docx, txt, zip, rar.',
            'files.*.max' => 'Kích thước file không được vượt quá 5MB.',
        ]);
    }

    /**
     * Xử lý upload hình ảnh
     */
    private function handleImageUploads(Request $request): array
    {
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('chat/images', 'public');
                $imagePaths[] = asset('storage/' . $path);
            }
        }
        return $imagePaths;
    }

    /**
     * Xử lý upload file
     */
    private function handleFileUploads(Request $request): array
    {
        $fileData = [];
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('chat/files', 'public');
                $fileData[] = [
                    'name' => $file->getClientOriginalName(),
                    'url' => asset('storage/' . $path),
                    'size' => $file->getSize(),
                    'type' => $file->getClientMimeType(),
                ];
            }
        }
        return $fileData;
    }
}
