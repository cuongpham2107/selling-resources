<?php

namespace App\Notifications\Customer;

use Illuminate\Auth\Notifications\ResetPassword as ResetPasswordBase;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends ResetPasswordBase
{
    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable): MailMessage
    {
        $url = $this->resetUrl($notifiable);

        return (new MailMessage)
            ->subject('Đặt lại mật khẩu tài khoản')
            ->greeting('Xin chào ' . $notifiable->username . '!')
            ->line('Bạn nhận được email này vì chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.')
            ->line('Để đặt lại mật khẩu, vui lòng nhấp vào nút bên dưới:')
            ->action('Đặt lại mật khẩu', $url)
            ->line('Link đặt lại mật khẩu này sẽ hết hạn sau 60 phút.')
            ->line('Nếu bạn không yêu cầu đặt lại mật khẩu, bạn có thể bỏ qua email này.')
            ->salutation('Trân trọng,')
            ->salutation('Đội ngũ hỗ trợ');
    }

    /**
     * Get the reset password URL for the given notifiable.
     */
    protected function resetUrl($notifiable): string
    {
        return route('customer.password.reset', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ]);
    }
}
