<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Password;
use App\Models\Customer;

class TestPasswordResetCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:password-reset {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test password reset functionality';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        
        $customer = Customer::where('email', $email)->first();
        
        if (!$customer) {
            $this->error('Customer not found with email: ' . $email);
            return;
        }
        
        $this->info('Customer found: ' . $customer->username);
        $this->info('Customer active: ' . ($customer->is_active ? 'Yes' : 'No'));
        $this->info('Email verified: ' . ($customer->hasVerifiedEmail() ? 'Yes' : 'No'));
        
        try {
            // Send password reset email
            $status = Password::broker('customers')->sendResetLink(['email' => $email]);
            
            if ($status == Password::RESET_LINK_SENT) {
                $this->info('✅ Password reset email sent successfully!');
                $this->info('Check your email for the reset link.');
            } else {
                $this->error('❌ Failed to send password reset email: ' . $status);
            }
            
        } catch (\Exception $e) {
            $this->error('❌ Error: ' . $e->getMessage());
        }
    }
}
