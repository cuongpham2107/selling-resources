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
        Schema::create('point_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('customer_id');
            $table->enum('type', ['earned', 'referral_bonus', 'sent', 'received', 'exchanged']);
            $table->decimal('amount', 15, 2);
            $table->decimal('balance_after', 15, 2);
            $table->string('related_transaction_type')->nullable(); // 'intermediate' hoặc 'store'
            $table->unsignedBigInteger('related_transaction_id')->nullable();
            $table->unsignedBigInteger('related_customer_id')->nullable(); // Người gửi/nhận
            $table->text('description')->nullable();
            $table->timestamps();

            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('cascade');
            $table->foreign('related_customer_id')->references('id')->on('customers')->onDelete('set null');
            $table->index(['customer_id', 'type']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('point_transactions');
    }
};
