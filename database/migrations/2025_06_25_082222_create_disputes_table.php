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
        Schema::create('disputes', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_type'); // 'intermediate' hoặc 'store'
            $table->unsignedBigInteger('transaction_id');
            $table->unsignedBigInteger('created_by'); // Người tạo tranh chấp
            $table->text('reason');
            $table->json('evidence')->nullable(); // Bằng chứng (ảnh, file)
            $table->enum('status', ['pending', 'processing', 'resolved', 'cancelled'])->default('pending');
            $table->unsignedBigInteger('assigned_to')->nullable(); // Admin/moderator được phân công
            $table->text('admin_notes')->nullable(); // Kết quả xử lý
            $table->enum('result', ['refund_buyer', 'pay_seller', 'partial_refund'])->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->foreign('created_by')->references('id')->on('customers')->onDelete('cascade');
            $table->foreign('assigned_to')->references('id')->on('customers')->onDelete('set null');
            $table->index(['transaction_type', 'transaction_id']);
            $table->index(['status', 'assigned_to']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('disputes');
    }
};
