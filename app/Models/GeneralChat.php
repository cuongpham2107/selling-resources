<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GeneralChat extends Model
{
    protected $fillable = [
        'sender_id',
        'message',
        'attached_product_id',
        'is_deleted',
        'deleted_by',
        'deleted_at',
    ];

    protected $casts = [
        'is_deleted' => 'boolean',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the customer who sent this general chat message
     * 
     * Lấy thông tin khách hàng đã gửi tin nhắn chat chung này
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'sender_id');
    }

    /**
     * Get the user who deleted this chat message
     * 
     * Lấy thông tin người dùng đã xóa tin nhắn chat này
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function deletedBy(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'deleted_by');
    }

    /**
     * Get the attached product for this general chat message
     * 
     * Lấy thông tin sản phẩm đính kèm cho tin nhắn chat tổng này
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function attachedProduct(): BelongsTo
    {
        return $this->belongsTo(StoreProduct::class, 'attached_product_id');
    }

    /**
     * Get all reports for this general chat message
     * 
     * Lấy tất cả báo cáo cho tin nhắn chat tổng này
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function reports(): HasMany
    {
        return $this->hasMany(ReportGeneralChat::class, 'general_chat_id');
    }

    /**
     * Check if a customer can send a general chat message
     * 
     * Kiểm tra xem khách hàng có thể gửi tin nhắn chat chung hay không
     * Kiểm tra giới hạn theo giờ và theo ngày
     * 
     * @param Customer $customer Khách hàng cần kiểm tra
     * @return bool True nếu có thể gửi tin nhắn
     */
    public function canSend(Customer $customer): bool
    {
        // Kiểm tra giới hạn chat tổng
        $hourlyLimit = SystemSetting::getValue('general_chat_hourly_limit', 1);
        $dailyLimit = SystemSetting::getValue('general_chat_daily_limit', 3);

        $lastHourCount = static::where('sender_id', $customer->id)
            ->where('created_at', '>=', now()->subHour())
            ->count();

        $todayCount = static::where('sender_id', $customer->id)
            ->whereDate('created_at', today())
            ->count();

        return $lastHourCount < $hourlyLimit && $todayCount < $dailyLimit;
    }

    /**
     * Mark this chat message as deleted by a moderator
     * 
     * Đánh dấu tin nhắn chat này là đã bị xóa bởi người điều hành
     * Không xóa vật lý mà chỉ đánh dấu để có thể khôi phục
     * 
     * @param \App\Models\User $moderator Người điều hành thực hiện xóa
     * @return bool True nếu đánh dấu thành công
     */
    public function markAsDeleted(\App\Models\User $moderator): bool
    {
        $this->is_deleted = true;
        $this->deleted_by = $moderator->id;
        $this->deleted_at = now();
        return $this->save();
    }

    /**
     * Restore this deleted chat message
     * 
     * Khôi phục tin nhắn chat đã bị xóa
     * 
     * @return bool True nếu khôi phục thành công
     */
    public function restore(): bool
    {
        $this->is_deleted = false;
        $this->deleted_by = null;
        $this->deleted_at = null;
        return $this->save();
    }

    /**
     * Scope to filter out deleted chat messages
     * 
     * Scope để lọc bỏ các tin nhắn chat đã bị xóa
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeNotDeleted($query)
    {
        return $query->where('is_deleted', false);
    }

    /**
     * Check if this message has been reported by a specific customer
     * 
     * Kiểm tra xem tin nhắn này đã được báo cáo bởi khách hàng cụ thể hay chưa
     * 
     * @param Customer $customer
     * @return bool
     */
    public function isReportedBy(Customer $customer): bool
    {
        return $this->reports()->where('reporter_id', $customer->id)->exists();
    }

    /**
     * Get the number of reports for this message
     * 
     * Lấy số lượng báo cáo cho tin nhắn này
     * 
     * @return int
     */
    public function getReportsCount(): int
    {
        return $this->reports()->count();
    }

    /**
     * Get pending reports count for this message
     * 
     * Lấy số lượng báo cáo đang chờ xử lý cho tin nhắn này
     * 
     * @return int
     */
    public function getPendingReportsCount(): int
    {
        return $this->reports()->pending()->count();
    }

    /**
     * Check if this message should be auto-hidden based on reports
     * 
     * Kiểm tra xem tin nhắn này có nên tự động ẩn dựa trên số lượng báo cáo không
     * 
     * @return bool
     */
    public function shouldAutoHide(): bool
    {
        $threshold = SystemSetting::getValue('general_chat_auto_hide_threshold', 3);
        return $this->getPendingReportsCount() >= $threshold;
    }
}
