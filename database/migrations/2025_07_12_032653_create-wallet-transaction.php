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
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_code', 20)->unique();
            $table->unsignedBigInteger('customer_id');
            $table->string('type')->nullable(); // Loại giao dịch
            $table->decimal('amount', 15, 2); // Số tiền giao dịch
            $table->decimal('fee', 15, 2)->default(0); // Phí giao dịch
            $table->decimal('net_amount', 15, 2); // Số tiền thực nhận (amount - fee cho rút tiền, amount cho nạp tiền)
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled'])->default('pending');
            $table->string('payment_method')->nullable(); // vnpay, bank_transfer, momo, zalo_pay
            $table->text('description')->nullable();
            
            // VNPay specific fields
            $table->string('vnpay_txn_ref')->nullable(); // Mã giao dịch VNPay
            $table->string('vnpay_transaction_no')->nullable(); // Mã giao dịch của VNPay
            $table->string('vnpay_bank_code')->nullable(); // Mã ngân hàng
            $table->string('vnpay_response_code')->nullable(); // Mã phản hồi từ VNPay
            $table->json('vnpay_response')->nullable(); // Full response từ VNPay
            
            // Withdrawal specific fields  
            $table->json('withdrawal_info')->nullable(); // Thông tin rút tiền (bank_name, account_number, etc.)
            
            // Transfer specific fields
            $table->unsignedBigInteger('recipient_id')->nullable(); // ID người nhận (cho transfer)
            $table->unsignedBigInteger('sender_id')->nullable(); // ID người gửi (cho transfer)
            $table->text('note')->nullable(); // Ghi chú của người dùng
            
            // Timestamps
            $table->timestamp('processed_at')->nullable(); // Thời gian xử lý
            $table->timestamp('completed_at')->nullable(); // Thời gian hoàn thành
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('cascade');
            $table->foreign('recipient_id')->references('id')->on('customers')->onDelete('set null');
            $table->foreign('sender_id')->references('id')->on('customers')->onDelete('set null');
            
            // Indexes
            $table->index(['customer_id', 'type', 'status']);
            $table->index(['status', 'created_at']);
            $table->index('vnpay_txn_ref');
            $table->index('transaction_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
    }
};
