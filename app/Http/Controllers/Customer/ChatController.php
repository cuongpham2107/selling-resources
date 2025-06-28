<?php

namespace App\Http\Controllers\Customer;

use App\Models\GeneralChat;
use App\Models\TransactionChat;
use App\Models\DailyChatLimit;
use App\Models\StoreTransaction;
use App\Models\StoreProduct;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends BaseCustomerController
{
    public function index(): Response
    {
        // Get recent general chat messages (public chat room)
        $generalChatMessages = GeneralChat::where('is_deleted', false)
            ->with(['sender:id,username', 'attachedProduct:id,name'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Get transaction chats
        $transactionChats = TransactionChat::whereHas('transaction', function ($query) {
            $query->where('buyer_id', $this->customer->id)
                  ->orWhere('seller_id', $this->customer->id);
        })
        ->with(['transaction.product:id,name', 'sender:id,username'])
        ->orderBy('created_at', 'desc')
        ->paginate(20);

        return Inertia::render('customer/Chat/Index', [
            'generalChatMessages' => $generalChatMessages,
            'transactionChats' => $transactionChats,
        ]);
    }
    /**
     * Hiển thị phòng chat công khai với tất cả tin nhắn và khả năng gửi tin nhắn mới
     */
    public function general(): Response
    {
        // Get or create daily chat limit record for today
        $chatLimit = DailyChatLimit::getOrCreateForToday($this->customer);
        
        // Check if user can send messages
        $canSendMessage = $chatLimit->canSendGeneralChat();
        
        // Calculate remaining messages (for display purposes)
        $maxChats = \App\Models\SystemSetting::getValue('general_chat_daily_limit', 3);
        $usedChats = $chatLimit->general_chat_count;
        $remainingMessages = max(0, $maxChats - $usedChats);

        // Get all general chat messages (public chat room)
        $chatMessages = GeneralChat::where('is_deleted', false)
            ->with(['sender:id,username', 'attachedProduct:id,name,price'])
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        // Get available products for attaching
        $availableProducts = StoreProduct::whereHas('store', function ($query) {
            $query->where('owner_id', '!=', $this->customer->id);
        })
        ->where('is_active', true)
        ->where('is_sold', false)
        ->where('is_deleted', false)
        ->select('id', 'name', 'price')
        ->limit(100)
        ->get();

        return Inertia::render('customer/Chat/General', [
            'canSendMessage' => $canSendMessage,
            'remainingMessages' => $remainingMessages,
            'chatMessages' => $chatMessages,
            'availableProducts' => $availableProducts,
            'currentUser' => $this->customer,
        ]);
    }

    public function createGeneral(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
            'attached_product_id' => ['nullable', 'exists:store_products,id'],
        ], [
            'message.required' => 'Nội dung tin nhắn là bắt buộc.',
            'message.string' => 'Nội dung tin nhắn phải là chuỗi ký tự.',
            'message.max' => 'Nội dung tin nhắn không được vượt quá 1000 ký tự.',
            'attached_product_id.exists' => 'Sản phẩm đính kèm không tồn tại.',
        ]);

        // Get or create daily chat limit record for today
        $chatLimit = DailyChatLimit::getOrCreateForToday($this->customer);
        
        // Check if user can send general chat messages
        if (!$chatLimit->canSendGeneralChat()) {
            return back()->withErrors(['message' => 'Đã đạt giới hạn tin nhắn hàng ngày hoặc cần chờ 1 giờ từ tin nhắn cuối. Hãy thử lại sau.']);
        }

        // Create general chat message (public chat room)
        GeneralChat::create([
            'sender_id' => $this->customer->id,
            'message' => $validated['message'],
            'attached_product_id' => $validated['attached_product_id'] ?? null,
        ]);

        // Increment chat count using the model method
        $chatLimit->incrementGeneralChat();

        return back()->with('success', 'Tin nhắn đã được gửi thành công!');
    }

    public function transaction(): Response
    {
        // Get user's transactions that can have chat
        $transactions = StoreTransaction::where(function ($query) {
            $query->where('buyer_id', $this->customer->id)
                  ->orWhere('seller_id', $this->customer->id);
        })
        ->with(['product:id,name', 'buyer:id,username', 'seller:id,username'])
        ->whereIn('status', ['processing', 'completed', 'disputed'])
        ->orderBy('created_at', 'desc')
        ->paginate(20);

        return Inertia::render('customer/Chat/Transaction', [
            'transactions' => $transactions,
        ]);
    }

    public function showTransaction(StoreTransaction $transaction): Response
    {
        
        
        // Check if user is participant in this transaction
        if ($transaction->buyer_id !== $this->customer->id && $transaction->seller_id !== $this->customer->id) {
            abort(403);
        }

        $transaction->load([
            'product:id,name',
            'buyer:id,username',
            'seller:id,username'
        ]);

        // Get transaction chat messages
        $chatMessages = TransactionChat::where('transaction_id', $transaction->id)
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

    public function sendTransactionMessage(Request $request, StoreTransaction $transaction): RedirectResponse
    {
        
        
        // Check if user is participant in this transaction
        if ($transaction->buyer_id !== $this->customer->id && $transaction->seller_id !== $this->customer->id) {
            abort(403);
        }

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
        ], [
            'message.required' => 'Nội dung tin nhắn là bắt buộc.',
            'message.string' => 'Nội dung tin nhắn phải là chuỗi ký tự.',
            'message.max' => 'Nội dung tin nhắn không được vượt quá 1000 ký tự.',
        ]);

        TransactionChat::create([
            'transaction_id' => $transaction->id,
            'sender_id' => $this->customer->id,
            'message' => $validated['message'],
        ]);

        return back()->with('success', 'Tin nhắn đã được gửi thành công!');
    }

    public function rules(): Response
    {
        $dailyLimit = \App\Models\SystemSetting::getValue('general_chat_daily_limit', 3);
        
        return Inertia::render('customer/Chat/Rules', [
            'rules' => [
                'Tôn trọng người dùng khác',
                'Không spam hoặc quảng cáo',
                'Không chia sẻ thông tin liên lạc cá nhân',
                'Báo cáo hành vi không phù hợp',
                'Giữ cuộc trò chuyện liên quan đến giao dịch',
                "Giới hạn trò chuyện hàng ngày: {$dailyLimit} cuộc trò chuyện",
                'Chỉ được gửi tin nhắn mỗi giờ một lần',
            ],
        ]);
    }

    public function block(Request $request): RedirectResponse
    {
        
        
        $validated = $request->validate([
            'blocked_username' => ['required', 'string', 'exists:customers,username'],
            'reason' => ['nullable', 'string', 'max:200'],
        ], [
            'blocked_username.required' => 'Tên người dùng cần chặn là bắt buộc.',
            'blocked_username.string' => 'Tên người dùng phải là chuỗi ký tự.',
            'blocked_username.exists' => 'Tên người dùng không tồn tại.',
            'reason.string' => 'Lý do phải là chuỗi ký tự.',
            'reason.max' => 'Lý do không được vượt quá 200 ký tự.',
        ]);

        if ($validated['blocked_username'] === $this->customer->username) {
            return back()->withErrors(['blocked_username' => 'Không thể chặn chính mình.']);
        }

        // Here you would implement user blocking logic
        // This could involve creating a blocked_users table and preventing chats

        return back()->with('success', 'Người dùng đã được chặn thành công.');
    }

    public function transactionDetail(WalletTransaction $transaction): Response
    {
        // Check if user is participant in this transaction
        if ($transaction->customer_id !== $this->customer->id && $transaction->recipient_id !== $this->customer->id && $transaction->sender_id !== $this->customer->id) {
            abort(403, 'Bạn không có quyền truy cập chat giao dịch này');
        }

        $transaction->load([
            'customer:id,username,email,created_at',
            'recipient:id,username,email,created_at',
            'sender:id,username,email,created_at'
        ]);

        // Get transaction chat messages with pagination
        $messages = TransactionChat::where('transaction_id', $transaction->id)
            ->where('transaction_type', 'wallet')
            ->with('sender:id,username')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return Inertia::render('customer/Chat/TransactionDetail', [
            'transaction' => $transaction,
            'messages' => $messages,
        ]);
    }

    public function sendTransactionDetailMessage(Request $request, WalletTransaction $transaction): RedirectResponse
    {
        // Check if user is participant in this transaction
        if ($transaction->customer_id !== $this->customer->id && $transaction->recipient_id !== $this->customer->id && $transaction->sender_id !== $this->customer->id) {
            abort(403, 'Bạn không có quyền gửi tin nhắn trong giao dịch này');
        }

        // Check if transaction allows chatting
        if (in_array($transaction->status, ['cancelled', 'completed'])) {
            return back()->withErrors(['message' => 'Không thể gửi tin nhắn trong giao dịch đã hoàn thành hoặc bị hủy']);
        }

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
        ], [
            'message.required' => 'Nội dung tin nhắn là bắt buộc.',
            'message.string' => 'Nội dung tin nhắn phải là chuỗi ký tự.',
            'message.max' => 'Nội dung tin nhắn không được vượt quá 1000 ký tự.',
        ]);

        TransactionChat::create([
            'transaction_id' => $transaction->id,
            'transaction_type' => 'wallet',
            'sender_id' => $this->customer->id,
            'message' => $validated['message'],
        ]);

        return back()->with('success', 'Tin nhắn đã được gửi thành công!');
    }

    public function report(Request $request): RedirectResponse
    {
        
        
        $validated = $request->validate([
            'reported_username' => ['required', 'string', 'exists:customers,username'],
            'reason' => ['required', 'string', 'in:spam,harassment,inappropriate,scam,other'],
            'description' => ['required', 'string', 'max:500'],
            'chat_id' => ['nullable', 'exists:general_chats,id'],
        ], [
            'reported_username.required' => 'Tên người dùng cần báo cáo là bắt buộc.',
            'reported_username.string' => 'Tên người dùng phải là chuỗi ký tự.',
            'reported_username.exists' => 'Tên người dùng không tồn tại.',
            'reason.required' => 'Lý do báo cáo là bắt buộc.',
            'reason.string' => 'Lý do báo cáo phải là chuỗi ký tự.',
            'reason.in' => 'Lý do báo cáo không hợp lệ.',
            'description.required' => 'Mô tả chi tiết là bắt buộc.',
            'description.string' => 'Mô tả chi tiết phải là chuỗi ký tự.',
            'description.max' => 'Mô tả chi tiết không được vượt quá 500 ký tự.',
            'chat_id.exists' => 'Cuộc trò chuyện không tồn tại.',
        ]);

        // Here you would implement user reporting logic
        // This could involve creating a reports table for admin review

        return back()->with('success', 'Báo cáo đã được gửi thành công. Đội ngũ của chúng tôi sẽ xem xét.');
    }
}
