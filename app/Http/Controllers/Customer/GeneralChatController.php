<?php

namespace App\Http\Controllers\Customer;

use App\Models\GeneralChat;
use App\Models\DailyChatLimit;
use App\Models\StoreProduct;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class GeneralChatController extends BaseCustomerController
{
    /**
     * Hiển thị danh sách chat chung với pagination
     */
    public function index(): Response
    {
        // Get recent general chat messages (public chat room)
        $generalChatMessages = GeneralChat::where('is_deleted', false)
            ->with(['sender:id,username', 'attachedProduct:id,name'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('customer/Chat/GeneralIndex', [
            'generalChatMessages' => $generalChatMessages,
        ]);
    }

    /**
     * Hiển thị phòng chat công khai với tất cả tin nhắn và khả năng gửi tin nhắn mới
     */
    public function show(): Response
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

        // Get user's products for attaching to messages
        $userProducts = StoreProduct::whereHas('store', function ($query) {
                $query->where('owner_id', $this->customer->id);
            })
            ->where('is_active', true)
            ->where('is_deleted', false)
            ->where('is_sold', false)
            ->select('id', 'name', 'price')
            ->orderBy('name')
            ->get();

        return Inertia::render('customer/Chat/GeneralIndex', [
            'canSendMessage' => $canSendMessage,
            'remainingMessages' => $remainingMessages,
            'maxMessages' => $maxChats,
            'usedMessages' => $usedChats,
            'chatMessages' => $chatMessages,
            'currentUser' => $this->customer,
            'lastChatTime' => $chatLimit->last_general_chat_at?->toISOString(),
            'userProducts' => $userProducts,
        ]);
    }

    /**
     * Tạo tin nhắn chat chung mới
     */
    public function store(Request $request): RedirectResponse
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
       
        // If attached_product_id is provided, verify it belongs to the user
        if ($validated['attached_product_id']) {
            $product = StoreProduct::where('id', $validated['attached_product_id'])
                ->first();
            if (!$product && $product->seller_id !== $this->customer->id) {
                return back()->withErrors(['attached_product_id' => 'Bạn chỉ có thể đính kèm sản phẩm của chính mình.']);
            }
        }

        // Create general chat message (public chat room)
        GeneralChat::create([
            'sender_id' => $this->customer->id,
            'message' => $validated['message'],
            'attached_product_id' => $validated['attached_product_id'],
        ]);

        // Increment chat count using the model method
        $chatLimit->incrementGeneralChat();

        return back()->with('success', 'Tin nhắn đã được gửi thành công!');
    }

    /**
     * Hiển thị quy tắc chat chung
     */
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

    /**
     * Chặn người dùng
     */
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

    /**
     * Báo cáo tin nhắn hoặc người dùng
     */
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
