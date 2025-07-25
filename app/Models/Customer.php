<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Fortify\TwoFactorAuthenticatable;


class Customer extends Authenticatable implements MustVerifyEmail
{
    use Notifiable, TwoFactorAuthenticatable;

    protected $fillable = [
        'username',
        'email',
        'password',
        'phone',
        'is_active',
        'referral_code',
        'referred_by',
        'kyc_verified_at',
        'kyc_data',
        'password_changed_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'kyc_verified_at' => 'datetime',
        'password_changed_at' => 'datetime',
        'kyc_data' => 'array',
        'is_active' => 'boolean',
        'password' => 'hashed',
        'two_factor_confirmed_at' => 'datetime',
    ];

    /**
     * Boot method để tự tạo referral code khi tạo customer mới
     * 
     * Boot method to automatically generate referral code when creating new customer
     * 
     * @return void
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($customer) {
            if (empty($customer->referral_code)) {
                $customer->referral_code = $customer->generateReferralCode();
            }
        });
    }

    // Relationships
    /**
     * Get the customer's balance record
     * 
     * Lấy bản ghi số dư của khách hàng
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function balance(): HasOne
    {
        return $this->hasOne(CustomerBalance::class);
    }

    /**
     * Get the customer's points record
     * 
     * Lấy bản ghi điểm của khách hàng
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function points(): HasOne
    {
        return $this->hasOne(CustomerPoint::class);
    }

    /**
     * Get available balance computed from balance relationship
     * 
     * Lấy số dư khả dụng được tính từ balance relationship
     * 
     * @return float
     */
    public function getAvailableBalanceComputedAttribute(): float
    {
        if (!$this->balance) {
            return 0.0;
        }
        
        return $this->balance->balance - $this->balance->locked_balance;
    }

    /**
     * Get the customer's personal store
     * 
     * Lấy cửa hàng cá nhân của khách hàng
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function personalStore(): HasOne
    {
        return $this->hasOne(PersonalStore::class, 'owner_id');
    }

    /**
     * Get the customer who referred this customer
     * 
     * Lấy thông tin khách hàng đã giới thiệu khách hàng này
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function referrer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'referred_by');
    }

    /**
     * Get all customers referred by this customer (using direct relationship)
     * 
     * Lấy tất cả khách hàng được giới thiệu bởi khách hàng này (sử dụng mối quan hệ trực tiếp)
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function referrals(): HasMany
    {
        return $this->hasMany(Customer::class, 'referred_by');
    }

    /**
     * Get all transactions where this customer is the buyer
     * 
     * Lấy tất cả giao dịch mà khách hàng này là người mua
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function buyerTransactions(): HasMany
    {
        return $this->hasMany(IntermediateTransaction::class, 'buyer_id');
    }

    /**
     * Get all transactions where this customer is the seller
     * 
     * Lấy tất cả giao dịch mà khách hàng này là người bán
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function sellerTransactions(): HasMany
    {
        return $this->hasMany(IntermediateTransaction::class, 'seller_id');
    }

    /**
     * Get all store transactions where this customer is the buyer
     * 
     * Lấy tất cả giao dịch cửa hàng mà khách hàng này là người mua
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function buyerStoreTransactions(): HasMany
    {
        return $this->hasMany(StoreTransaction::class, 'buyer_id');
    }

    /**
     * Get all store transactions where this customer is the seller
     * 
     * Lấy tất cả giao dịch cửa hàng mà khách hàng này là người bán
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function sellerStoreTransactions(): HasMany
    {
        return $this->hasMany(StoreTransaction::class, 'seller_id');
    }

    /**
     * Get all chats sent by this customer
     * 
     * Lấy tất cả tin nhắn được gửi bởi khách hàng này
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function chats(): HasMany
    {
        return $this->hasMany(TransactionChat::class, 'sender_id');
    }

    /**
     * Get all general chats sent by this customer
     * 
     * Lấy tất cả tin nhắn chung được gửi bởi khách hàng này
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function generalChats(): HasMany
    {
        return $this->hasMany(GeneralChat::class, 'sender_id');
    }

    /**
     * Get all point transactions for this customer
     * 
     * Lấy tất cả giao dịch điểm của khách hàng này
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function pointTransactions(): HasMany
    {
        return $this->hasMany(PointTransaction::class);
    }

    /**
     * Get all top-up transactions (deposits) for this customer
     * 
     * Lấy tất cả giao dịch nạp tiền của khách hàng này
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function topups(): HasMany
    {
        return $this->hasMany(WalletTransaction::class)->where('type', 'deposit');
    }

    /**
     * Get all disputes created by this customer
     * 
     * Lấy tất cả tranh chấp được tạo bởi khách hàng này
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function createdDisputes(): HasMany
    {
        return $this->hasMany(Dispute::class, 'created_by');
    }

    /**
     * Get all daily chat limits for this customer
     * 
     * Lấy tất cả giới hạn chat hằng ngày của khách hàng này
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function dailyChatLimits(): HasMany
    {
        return $this->hasMany(DailyChatLimit::class);
    }

    /**
     * Get all referrals made by this customer (using separate Referral model)
     * 
     * Lấy tất cả giới thiệu được thực hiện bởi khách hàng này (sử dụng model Referral riêng biệt)
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function referralsMade(): HasMany
    {
        return $this->hasMany(Referral::class, 'referrer_id');
    }

    /**
     * Get all referrals received by this customer (using separate Referral model)
     * 
     * Lấy tất cả giới thiệu nhận được bởi khách hàng này (sử dụng model Referral riêng biệt)
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function referralsReceived(): HasMany
    {
        return $this->hasMany(Referral::class, 'referred_id');
    }

    /**
     * Get all general chat reports made by this customer
     * 
     * Lấy tất cả báo cáo chat tổng do khách hàng này tạo
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function generalChatReports(): HasMany
    {
        return $this->hasMany(ReportGeneralChat::class, 'reporter_id');
    }

    /**
     * Generate a unique referral code for the customer
     * 
     * Tạo mã giới thiệu duy nhất cho khách hàng
     * Mã gồm 8 ký tự bao gồm chữ cái in hoa và số
     * 
     * @return string Mã giới thiệu duy nhất
     */
    protected function generateReferralCode(): string
    {
        do {
            // Tạo mã 8 ký tự ngẫu nhiên (chữ hoa + số)
            $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            $code = '';
            for ($i = 0; $i < 8; $i++) {
                $code .= $characters[rand(0, strlen($characters) - 1)];
            }
        } while (static::where('referral_code', $code)->exists());

        return $code;
    }

    /**
     * Check if the customer account is active
     * 
     * Kiểm tra xem tài khoản khách hàng có đang hoạt động hay không
     * 
     * @return bool True nếu tài khoản đang hoạt động
     */
    public function isActive(): bool
    {
        return (bool) $this->is_active;
    }

    /**
     * Check if the customer has verified KYC
     * 
     * Kiểm tra xem khách hàng đã xác minh KYC hay chưa
     * 
     * @return bool True nếu KYC đã được xác minh
     */
    public function hasVerifiedKyc(): bool
    {
        return !is_null($this->kyc_verified_at);
    }

    /**
     * Get the display name attribute for the customer
     * 
     * Lấy tên hiển thị của khách hàng
     * 
     * @return string Tên hiển thị (username)
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->username;
    }

    /**
     * Send the email verification notification.
     *
     * @return void
     */
    public function sendEmailVerificationNotification()
    {
        $this->notify(new \App\Notifications\Customer\VerifyEmail());
    }

    /**
     * Send the password reset notification.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new \App\Notifications\Customer\ResetPasswordNotification($token));
    }

    /**
     * Get the referral link attribute for the customer
     * 
     * Lấy liên kết giới thiệu của khách hàng
     * 
     * @return string URL liên kết giới thiệu
     */
    public function getReferralLinkAttribute(): string
    {
        return url("/?ref={$this->referral_code}");
    }

    /**
     * Get all wallet transactions for this customer
     * 
     * Lấy tất cả giao dịch ví của khách hàng này
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function walletTransactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class);
    }

    /**
     * Enable two factor authentication for the customer.
     */
    public function enableTwoFactorAuthentication(): void
    {
        $this->forceFill([
            'two_factor_secret' => encrypt(app(\Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider::class)->generateSecretKey()),
            'two_factor_recovery_codes' => encrypt(json_encode(\Laravel\Fortify\RecoveryCode::generate())),
        ])->save();
    }

    /**
     * Confirm two factor authentication for the customer.
     */
    public function confirmTwoFactorAuthentication(string $code): bool
    {
        if (app(\Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider::class)->verify(
            decrypt($this->two_factor_secret), $code
        )) {
            $this->forceFill([
                'two_factor_confirmed_at' => now(),
            ])->save();

            return true;
        }

        return false;
    }

    /**
     * Disable two factor authentication for the customer.
     */
    public function disableTwoFactorAuthentication(): void
    {
        $this->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();
    }

    /**
     * Replace the given recovery codes.
     */
    public function replaceRecoveryCodes(): void
    {
        $this->forceFill([
            'two_factor_recovery_codes' => encrypt(json_encode(\Laravel\Fortify\RecoveryCode::generate())),
        ])->save();
    }

    /**
     * Get the QR code SVG for the customer's two factor authentication.
     */
    public function twoFactorQrCodeSvg(): string
    {
        if (!$this->two_factor_secret) {
            return '';
        }

        $writer = new \BaconQrCode\Writer(
            new \BaconQrCode\Renderer\ImageRenderer(
                new \BaconQrCode\Renderer\RendererStyle\RendererStyle(200),
                new \BaconQrCode\Renderer\Image\SvgImageBackEnd()
            )
        );

        return $writer->writeString($this->twoFactorQrCodeUrl());
    }

    /**
     * Get the QR code URL for the customer's two factor authentication.
     */
    public function twoFactorQrCodeUrl(): string
    {
        if (!$this->two_factor_secret) {
            return '';
        }

        $secret = decrypt($this->two_factor_secret);
        $appName = urlencode(config('app.name'));
        $email = urlencode($this->email);
        
        return "otpauth://totp/{$appName}:{$email}?secret={$secret}&issuer={$appName}";
    }

    /**
     * Check if the customer has enabled two factor authentication.
     */
    public function hasEnabledTwoFactorAuthentication(): bool
    {
        return !is_null($this->two_factor_secret) && !is_null($this->two_factor_confirmed_at);
    }
}
