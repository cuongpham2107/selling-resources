<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\SystemSetting;

class DailyChatLimit extends Model
{
    protected $fillable = [
        'customer_id',
        'date',
        'general_chat_count',
        'transaction_chat_images',
        'last_general_chat_at',
    ];

    protected $casts = [
        'date' => 'date',
        'last_general_chat_at' => 'datetime',
    ];

    /**
     * Get the customer that owns this daily chat limit record
     * 
     * Lấy thông tin khách hàng sở hữu bản ghi giới hạn chat hằng ngày này
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get or create a daily chat limit record for today
     * 
     * Lấy hoặc tạo bản ghi giới hạn chat hằng ngày cho hôm nay
     * Nếu chưa có bản ghi cho ngày hôm nay, sẽ tạo mới với giá trị mặc định
     * 
     * @param Customer $customer Khách hàng cần lấy/tạo bản ghi
     * @return self Bản ghi giới hạn chat hằng ngày
     */
    public static function getOrCreateForToday(Customer $customer): self
    {
        return static::firstOrCreate([
            'customer_id' => $customer->id,
            'date' => today(),
        ], [
            'general_chat_count' => 0,
            'transaction_chat_images' => 0,
        ]);
    }

    /**
     * Check if the customer can send general chat messages
     * 
     * Kiểm tra xem khách hàng có thể gửi tin nhắn chat chung hay không
     * Kiểm tra cả giới hạn theo giờ và theo ngày
     * 
     * @return bool True nếu có thể gửi tin nhắn chat chung
     */
    public function canSendGeneralChat(): bool
    {
        $hourlyLimit = SystemSetting::getValue('general_chat_hourly_limit', 1);
        $dailyLimit = SystemSetting::getValue('general_chat_daily_limit', 3);
        // Kiểm tra giới hạn theo ngày trước
        if ($this->general_chat_count >= $dailyLimit || $this->general_chat_count > $hourlyLimit) {
            return false;
        }
       
        // Kiểm tra giới hạn theo giờ (nếu có tin nhắn trước đó)
        $lastChatTime = $this->last_general_chat_at;
        if ($lastChatTime && $lastChatTime->diffInMinutes(now()) < 60 && $this->general_chat_count >= $hourlyLimit) {
            return false;
        }
        
        return true;
    }

    /**
     * Check if the customer can send transaction images
     * 
     * Kiểm tra xem khách hàng có thể gửi hình ảnh trong chat giao dịch hay không
     * Kiểm tra giới hạn số lượng hình ảnh được gửi trong ngày
     * 
     * @return bool True nếu có thể gửi hình ảnh giao dịch
     */
    public function canSendTransactionImages(): bool
    {
        $dailyLimit = SystemSetting::getValue('transaction_chat_daily_image_limit', 3);
        return $this->transaction_chat_images < $dailyLimit;
    }

    /**
     * Increment the general chat count and update last chat time
     * 
     * Tăng số lượng chat chung và cập nhật thời gian chat cuối cùng
     * 
     * @return void
     */
    public function incrementGeneralChat(): void
    {
        $this->general_chat_count += 1;
        $this->last_general_chat_at = now();
        $this->save();
    }

    /**
     * Increment the transaction images count
     * 
     * Tăng số lượng hình ảnh giao dịch đã gửi
     * 
     * @param int $count Số lượng hình ảnh cần tăng (mặc định là 1)
     * @return void
     */
    public function incrementTransactionImages(int $count = 1): void
    {
        $this->transaction_chat_images += $count;
        $this->save();
    }
}
