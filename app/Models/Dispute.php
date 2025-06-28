<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Dispute extends Model
{
    protected $fillable = [
        'transaction_type',
        'transaction_id',
        'created_by',
        'reason',
        'evidence',
        'status',
        'assigned_to',
        'result',
        'admin_notes',
        'resolved_at',
    ];

    protected $casts = [
        'evidence' => 'array',
        'resolved_at' => 'datetime',
    ];

    /**
     * Get the customer who created this dispute
     * 
     * Lấy thông tin khách hàng đã tạo tranh chấp này
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'created_by');
    }

    /**
     * Get the moderator assigned to this dispute (deprecated, use assignedTo instead)
     * 
     * Lấy người điều hành được phân công cho tranh chấp này (đã lỗi thời, sử dụng assignedTo thay thế)
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function assignedModerator(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'assigned_to');
    }

    /**
     * Get the user assigned to handle this dispute
     * 
     * Lấy người dùng được phân công xử lý tranh chấp này
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'assigned_to');
    }

    /**
     * Get the transaction related to this dispute
     * 
     * Lấy giao dịch liên quan đến tranh chấp này
     * Tự động phân biệt giữa giao dịch trung gian và giao dịch cửa hàng
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function transaction()
    {
        return $this->transaction_type === 'intermediate' 
            ? $this->belongsTo(IntermediateTransaction::class, 'transaction_id')
            : $this->belongsTo(StoreTransaction::class, 'transaction_id');
    }

    /**
     * Check if the dispute is in pending status
     * 
     * Kiểm tra xem tranh chấp có đang ở trạng thái chờ xử lý hay không
     * 
     * @return bool True nếu tranh chấp đang chờ xử lý
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the dispute is currently being processed
     * 
     * Kiểm tra xem tranh chấp có đang được xử lý hay không
     * 
     * @return bool True nếu tranh chấp đang được xử lý
     */
    public function isProcessing(): bool
    {
        return $this->status === 'processing';
    }

    /**
     * Check if the dispute has been resolved
     * 
     * Kiểm tra xem tranh chấp đã được giải quyết hay chưa
     * 
     * @return bool True nếu tranh chấp đã được giải quyết
     */
    public function isResolved(): bool
    {
        return $this->status === 'resolved';
    }

    /**
     * Check if the dispute has been cancelled
     * 
     * Kiểm tra xem tranh chấp đã bị hủy hay chưa
     * 
     * @return bool True nếu tranh chấp đã bị hủy
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Check if the dispute can be assigned to a moderator
     * 
     * Kiểm tra xem tranh chấp có thể được phân công cho người điều hành hay không
     * 
     * @return bool True nếu có thể phân công
     */
    public function canBeAssigned(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the dispute can be resolved
     * 
     * Kiểm tra xem tranh chấp có thể được giải quyết hay không
     * 
     * @return bool True nếu có thể giải quyết
     */
    public function canBeResolved(): bool
    {
        return $this->status === 'processing';
    }

    /**
     * Assign the dispute to a moderator
     * 
     * Phân công tranh chấp cho một người điều hành
     * Chỉ có thể phân công khi tranh chấp đang ở trạng thái pending
     * 
     * @param \App\Models\User $moderator Người điều hành được phân công
     * @return bool True nếu phân công thành công
     */
    public function assign(\App\Models\User $moderator): bool
    {
        if (!$this->canBeAssigned()) {
            return false;
        }

        $this->assigned_to = $moderator->id;
        $this->status = 'processing';
        return $this->save();
    }

    /**
     * Resolve the dispute with a result and admin notes
     * 
     * Giải quyết tranh chấp với kết quả và ghi chú của admin
     * Chỉ có thể giải quyết khi tranh chấp đang ở trạng thái processing
     * 
     * @param string $result Kết quả giải quyết tranh chấp
     * @param string|null $adminNotes Ghi chú của admin (tùy chọn)
     * @return bool True nếu giải quyết thành công
     */
    public function resolve(string $result, string $adminNotes = null): bool
    {
        if (!$this->canBeResolved()) {
            return false;
        }

        $this->result = $result;
        $this->admin_notes = $adminNotes;
        $this->status = 'resolved';
        $this->resolved_at = now();
        return $this->save();
    }
}
