<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportGeneralChat extends Model
{
    protected $fillable = [
        'general_chat_id',
        'reporter_id',
        'reason',
        'description',
        'status',
        'handled_by',
        'admin_note',
        'handled_at',
    ];

    protected $casts = [
        'handled_at' => 'datetime',
    ];

    /**
     * Get the general chat message that was reported
     * 
     * Lấy tin nhắn chat tổng bị báo cáo
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function generalChat(): BelongsTo
    {
        return $this->belongsTo(GeneralChat::class, 'general_chat_id');
    }

    /**
     * Get the customer who reported this message
     * 
     * Lấy khách hàng đã báo cáo tin nhắn này
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'reporter_id');
    }

    /**
     * Get the admin who handled this report
     * 
     * Lấy admin đã xử lý báo cáo này
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function handler(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handled_by');
    }

    /**
     * Mark this report as resolved by admin
     * 
     * Đánh dấu báo cáo này đã được xử lý bởi admin
     * 
     * @param \App\Models\User $admin Admin xử lý
     * @param string $note Ghi chú của admin
     * @return bool
     */
    public function markAsResolved(User $admin, string $note = null): bool
    {
        $this->status = 'resolved';
        $this->handled_by = $admin->id;
        $this->admin_note = $note;
        $this->handled_at = now();
        return $this->save();
    }

    /**
     * Mark this report as rejected by admin
     * 
     * Đánh dấu báo cáo này bị từ chối bởi admin
     * 
     * @param \App\Models\User $admin Admin xử lý
     * @param string $note Lý do từ chối
     * @return bool
     */
    public function markAsRejected(User $admin, string $note = null): bool
    {
        $this->status = 'rejected';
        $this->handled_by = $admin->id;
        $this->admin_note = $note;
        $this->handled_at = now();
        return $this->save();
    }

    /**
     * Get available report reasons
     * 
     * Lấy danh sách lý do báo cáo có sẵn
     * 
     * @return array
     */
    public static function getReasons(): array
    {
        return [
            'spam' => 'Spam hoặc quảng cáo',
            'inappropriate' => 'Nội dung không phù hợp',
            'harassment' => 'Quấy rối hoặc bắt nạt',
            'fraud' => 'Lừa đảo hoặc gian lận',
            'hate_speech' => 'Ngôn từ thù địch',
            'violence' => 'Bạo lực hoặc đe dọa',
            'personal_info' => 'Chia sẻ thông tin cá nhân',
            'other' => 'Lý do khác',
        ];
    }

    /**
     * Scope to get pending reports
     * 
     * Scope lấy các báo cáo đang chờ xử lý
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope to get reports under review
     * 
     * Scope lấy các báo cáo đang được xem xét
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeReviewing($query)
    {
        return $query->where('status', 'reviewing');
    }

    /**
     * Scope to get resolved reports
     * 
     * Scope lấy các báo cáo đã được xử lý
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeResolved($query)
    {
        return $query->where('status', 'resolved');
    }
}
