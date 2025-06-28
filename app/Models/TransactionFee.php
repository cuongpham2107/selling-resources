<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionFee extends Model
{
    protected $fillable = [
        'min_amount',
        'max_amount',
        'fee_amount',
        'fee_percentage',
        'daily_fee_percentage',
        'points_reward',
        'is_active',
    ];

    protected $casts = [
        'min_amount' => 'decimal:2',
        'max_amount' => 'decimal:2',
        'fee_amount' => 'decimal:2',
        'fee_percentage' => 'decimal:2',
        'daily_fee_percentage' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    // Helper methods
    public static function getApplicableFee(float $amount): ?self
    {
        return static::where('is_active', true)
                    ->where('min_amount', '<=', $amount)
                    ->where(function ($query) use ($amount) {
                        $query->whereNull('max_amount')
                              ->orWhere('max_amount', '>=', $amount);
                    })
                    ->orderBy('min_amount', 'desc')
                    ->first();
    }

    public function calculateTotalFee(float $amount, int $durationHours = 1): float
    {
        $baseFee = $this->fee_amount + ($amount * $this->fee_percentage / 100);
        
        // Thêm phí 20% nếu duration >= 24 giờ (chỉ cộng 1 lần, không nhân với số ngày)
        if ($durationHours >= 24) {
            $dailyFeePercentage = $this->daily_fee_percentage / 100;
            $baseFee += $baseFee * $dailyFeePercentage;
        }

        return round($baseFee, 2);
    }

    public function getFormattedRangeAttribute(): string
    {
        $min = number_format($this->min_amount, 0, ',', '.');
        
        if ($this->max_amount) {
            $max = number_format($this->max_amount, 0, ',', '.');
            return "{$min} - {$max} VNĐ";
        }
        
        return "Trên {$min} VNĐ";
    }
}
