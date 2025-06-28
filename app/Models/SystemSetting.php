<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'description',
    ];

    /**
     * Get a system setting value by key with optional default
     * 
     * Lấy giá trị cài đặt hệ thống theo khóa với giá trị mặc định tùy chọn
     * Tự động chuyển đổi kiểu dữ liệu dựa trên trường type
     * 
     * @param string $key Khóa của cài đặt
     * @param mixed $default Giá trị mặc định nếu không tìm thấy
     * @return mixed Giá trị cài đặt đã được chuyển đổi kiểu
     */
    public static function getValue(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();
        
        if (!$setting) {
            return $default;
        }

        return match ($setting->type) {
            'integer' => (int) $setting->value,
            'decimal' => (float) $setting->value,
            'boolean' => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN),
            'json' => json_decode($setting->value, true),
            default => $setting->value,
        };
    }

    /**
     * Set a system setting value with type and description
     * 
     * Đặt giá trị cài đặt hệ thống với kiểu dữ liệu và mô tả
     * Tự động tạo mới hoặc cập nhật cài đặt hiện có
     * 
     * @param string $key Khóa của cài đặt
     * @param mixed $value Giá trị cần đặt
     * @param string $type Kiểu dữ liệu ('string', 'integer', 'decimal', 'boolean', 'json')
     * @param string|null $description Mô tả cho cài đặt (tùy chọn)
     * @return bool True nếu đặt thành công
     */
    public static function setValue(string $key, mixed $value, string $type = 'string', string $description = null): bool
    {
        $formattedValue = match ($type) {
            'json' => json_encode($value),
            'boolean' => $value ? '1' : '0',
            default => (string) $value,
        };

        return static::updateOrCreate(
            ['key' => $key],
            [
                'value' => $formattedValue,
                'type' => $type,
                'description' => $description,
            ]
        )->exists();
    }

    /**
     * Get the point to VND conversion rate
     * 
     * Lấy tỷ lệ quy đổi điểm sang VND
     * 
     * @return int Tỷ lệ quy đổi (mặc định: 500 VND/điểm)
     */
    public static function getPointToVndRate(): int
    {
        return static::getValue('point_to_vnd_rate', 500);
    }

    /**
     * Get the maximum total points a customer can accumulate
     * 
     * Lấy số điểm tối đa mà khách hàng có thể tích lũy
     * 
     * @return int Số điểm tối đa (mặc định: 50,000,000)
     */
    public static function getMaxTotalPoints(): int
    {
        return static::getValue('max_total_points', 50000000);
    }

    /**
     * Get the hourly limit for general chat messages
     * 
     * Lấy giới hạn số tin nhắn chat chung theo giờ
     * 
     * @return int Số tin nhắn tối đa mỗi giờ (mặc định: 1)
     */
    public static function getGeneralChatHourlyLimit(): int
    {
        return static::getValue('general_chat_hourly_limit', 1);
    }

    /**
     * Get the daily limit for general chat messages
     * 
     * Lấy giới hạn số tin nhắn chat chung theo ngày
     * 
     * @return int Số tin nhắn tối đa mỗi ngày (mặc định: 3)
     */
    public static function getGeneralChatDailyLimit(): int
    {
        return static::getValue('general_chat_daily_limit', 3);
    }

    /**
     * Get the daily limit for transaction chat images
     * 
     * Lấy giới hạn số hình ảnh trong chat giao dịch theo ngày
     * 
     * @return int Số hình ảnh tối đa mỗi ngày (mặc định: 3)
     */
    public static function getTransactionChatDailyImageLimit(): int
    {
        return static::getValue('transaction_chat_daily_image_limit', 3);
    }

    /**
     * Get the maximum number of products per upload
     * 
     * Lấy số lượng sản phẩm tối đa mỗi lần tải lên
     * 
     * @return int Số sản phẩm tối đa (mặc định: 5000)
     */
    public static function getMaxProductsPerUpload(): int
    {
        return static::getValue('max_products_per_upload', 5000);
    }

    /**
     * Get the transaction fee percentage for store transactions
     * 
     * Lấy phần trăm phí giao dịch cho giao dịch cửa hàng
     * 
     * @return float Phần trăm phí giao dịch (mặc định: 1.0%)
     */
    public static function getStoreTransactionFeePercentage(): float
    {
        return static::getValue('store_transaction_fee_percentage', 1.0);
    }

    /**
     * Get the hours after which store transactions are auto-completed
     * 
     * Lấy số giờ sau đó giao dịch cửa hàng sẽ được tự động hoàn thành
     * 
     * @return int Số giờ (mặc định: 72 giờ)
     */
    public static function getAutoCompleteStoreTransactionHours(): int
    {
        return static::getValue('auto_complete_store_transaction_hours', 72);
    }
}
