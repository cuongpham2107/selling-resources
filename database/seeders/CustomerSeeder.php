<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Customer;
use App\Models\CustomerBalance;
use App\Models\CustomerPoint;
use Illuminate\Support\Facades\Hash;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Tạo test customers
        $customers = [
            [
                'username' => 'testuser1',
                'email' => 'test1@example.com',
                'password' => Hash::make('password123'),
                'phone' => '0901234567',
                'is_active' => true,
                'email_verified_at' => now(),
                'referral_code' => 'TEST001',
            ],
            [
                'username' => 'testuser2',
                'email' => 'test2@example.com',
                'password' => Hash::make('password123'),
                'phone' => '0901234568',
                'is_active' => true,
                'email_verified_at' => now(),
                'referral_code' => 'TEST002',
            ],
            [
                'username' => 'testuser3',
                'email' => 'test3@example.com',
                'password' => Hash::make('password123'),
                'phone' => '0901234569',
                'is_active' => true,
                'email_verified_at' => now(),
                'referral_code' => 'TEST003',
            ],
        ];

        $createdCount = 0;
        foreach ($customers as $customerData) {
            // Kiểm tra xem customer đã tồn tại chưa
            $existingCustomer = Customer::where('username', $customerData['username'])
                ->orWhere('email', $customerData['email'])
                ->first();
            
            if (!$existingCustomer) {
                $customer = Customer::create($customerData);
                
                // Tạo balance cho customer
                CustomerBalance::create([
                    'customer_id' => $customer->id,
                    'balance' => rand(100000, 1000000), // Random balance 100k-1M VND
                ]);
                
                // Tạo points cho customer
                CustomerPoint::create([
                    'customer_id' => $customer->id,
                    'points' => rand(100, 1000), // Random points
                ]);
                
                $createdCount++;
            }
        }

        $this->command->info('Đã tạo ' . $createdCount . ' customers test (skipped existing)');
    }
}
