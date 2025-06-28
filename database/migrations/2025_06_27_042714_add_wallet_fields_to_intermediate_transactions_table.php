<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('intermediate_transactions', function (Blueprint $table) {
            // Add wallet-related fields
            $table->unsignedBigInteger('customer_id')->nullable()->after('id');
            $table->string('type')->nullable()->after('customer_id'); // deposit, withdrawal, transfer_in, transfer_out, etc.
            $table->string('payment_method')->nullable()->after('type'); // bank_transfer, momo, zalo_pay
            $table->json('withdrawal_info')->nullable()->after('payment_method');
            $table->unsignedBigInteger('recipient_id')->nullable()->after('withdrawal_info');
            $table->unsignedBigInteger('sender_id')->nullable()->after('recipient_id');
            
            // Make buyer_id and seller_id nullable for wallet transactions
            $table->unsignedBigInteger('buyer_id')->nullable()->change();
            $table->unsignedBigInteger('seller_id')->nullable()->change();
            $table->integer('duration_hours')->nullable()->change();
            $table->timestamp('expires_at')->nullable()->change();
            
            // Add foreign keys
            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('cascade');
            $table->foreign('recipient_id')->references('id')->on('customers')->onDelete('set null');
            $table->foreign('sender_id')->references('id')->on('customers')->onDelete('set null');
            
            // Add indexes
            $table->index(['customer_id', 'type']);
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('intermediate_transactions', function (Blueprint $table) {
            // Drop foreign keys
            $table->dropForeign(['customer_id']);
            $table->dropForeign(['recipient_id']);
            $table->dropForeign(['sender_id']);
            
            // Drop indexes
            $table->dropIndex(['customer_id', 'type']);
            $table->dropIndex(['type']);
            
            // Drop columns
            $table->dropColumn([
                'customer_id',
                'type',
                'payment_method',
                'withdrawal_info',
                'recipient_id',
                'sender_id'
            ]);
            
            // Revert nullable changes
            $table->unsignedBigInteger('buyer_id')->nullable(false)->change();
            $table->unsignedBigInteger('seller_id')->nullable(false)->change();
            $table->integer('duration_hours')->nullable(false)->change();
            $table->timestamp('expires_at')->nullable(false)->change();
        });
    }
};
