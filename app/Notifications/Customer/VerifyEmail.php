<?php

namespace App\Notifications\Customer;

use Illuminate\Auth\Notifications\VerifyEmail as VerifyEmailBase;
use Illuminate\Notifications\Messages\MailMessage;

class VerifyEmail extends VerifyEmailBase
{
    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable): MailMessage
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Xác thực địa chỉ email của bạn')
            ->greeting('Xin chào ' . $notifiable->username . '!')
            ->line('Cảm ơn bạn đã đăng ký tài khoản tại hệ thống của chúng tôi.')
            ->line('Để hoàn tất quá trình đăng ký, vui lòng nhấp vào nút bên dưới để xác thực địa chỉ email của bạn.')
            ->action('Xác thực Email', $verificationUrl)
            ->line('Nếu bạn không tạo tài khoản này, bạn có thể bỏ qua email này.')
            ->line('Liên kết xác thực này sẽ hết hạn sau 60 phút.')
            ->salutation('Trân trọng,')
            ->salutation('Đội ngũ hỗ trợ');
    }

    /**
     * Get the verification URL for the given notifiable.
     */
    protected function verificationUrl($notifiable): string
    {
        return route('customer.verification.verify', [
            'id' => $notifiable->getKey(),
            'hash' => sha1($notifiable->getEmailForVerification()),
        ]);
    }
}
