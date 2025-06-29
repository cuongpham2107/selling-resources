<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\GeneralChat;
use App\Models\ReportGeneralChat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReportGeneralChatController extends BaseCustomerController
{

    /**
     * Store a newly created report
     * 
     * Lưu báo cáo mới được tạo
     */
    public function store(Request $request)
    {
        $request->validate([
            'general_chat_id' => 'required|exists:general_chats,id',
            'reason' => 'required|string|in:' . implode(',', array_keys(ReportGeneralChat::getReasons())),
            'description' => 'nullable|string|max:1000',
        ]);

        
        $generalChat = GeneralChat::findOrFail($request->general_chat_id);

        // Prevent self-reporting
        if ($generalChat->sender_id === $this->customer->id) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Bạn không thể báo cáo tin nhắn của chính mình.',
                    'errors' => ['general_chat_id' => ['Bạn không thể báo cáo tin nhắn của chính mình.']]
                ], 422);
            }
            return back()->withErrors(['general_chat_id' => 'Bạn không thể báo cáo tin nhắn của chính mình.']);
        }

        // Check if already reported
        if ($generalChat->isReportedBy($this->customer)) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Bạn đã báo cáo tin nhắn này rồi.',
                    'errors' => ['general_chat_id' => ['Bạn đã báo cáo tin nhắn này rồi.']]
                ], 422);
            }
            return back()->withErrors(['general_chat_id' => 'Bạn đã báo cáo tin nhắn này rồi.']);
        }

        // Create report
        ReportGeneralChat::create([
            'general_chat_id' => $request->general_chat_id,
            'reporter_id' => $this->customer->id,
            'reason' => $request->reason,
            'description' => $request->description,
        ]);

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Báo cáo đã được gửi thành công. Chúng tôi sẽ xem xét và xử lý sớm nhất có thể.',
                'success' => true
            ]);
        }

        return redirect()->route('customer.chat.general')
            ->with('success', 'Báo cáo đã được gửi thành công. Chúng tôi sẽ xem xét và xử lý sớm nhất có thể.');
    }
}
