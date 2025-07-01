<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Customer;
use Illuminate\Support\Facades\URL;

class GenerateVerificationLinkCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'customer:verification-link {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate a fresh email verification link for a customer';

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
        $this->info('Email verified: ' . ($customer->hasVerifiedEmail() ? 'Yes' : 'No'));
        
        // Generate verification URL manually
        $url = URL::temporarySignedRoute(
            'customer.verification.verify',
            now()->addMinutes(60),
            [
                'id' => $customer->id,
                'hash' => sha1($customer->getEmailForVerification()),
            ]
        );
        
        $this->info('Verification URL: ' . $url);
        
        // Send email
        try {
            $customer->sendEmailVerificationNotification();
            $this->info('✅ New verification email sent successfully!');
        } catch (\Exception $e) {
            $this->error('❌ Failed to send email: ' . $e->getMessage());
        }
    }
}
