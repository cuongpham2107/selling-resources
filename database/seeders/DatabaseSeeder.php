<?php

namespace Database\Seeders;

use App\Models\DailyChatLimit;
use App\Models\Dispute;
use App\Models\GeneralChat;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            SystemSettingsSeeder::class,
            TransactionFeesSeeder::class,
            CustomerSeeder::class,
            DailyChatLimitSeeder::class,
            DisputeSeeder::class,
            GeneralChatSeeder::class,
            PersonalStoreSeeder::class,
            StoreProductSeeder::class,
            StoreTransactionSeeder::class,
            IntermediateTransactionSeeder::class,
            ReferralSeeder::class,
            TransactionChatSeeder::class,
            TransactionFeesSeeder::class,
           
        ]);
    }
}
