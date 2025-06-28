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
        Schema::create('transaction_fees', function (Blueprint $table) {
            $table->id();
            $table->decimal('min_amount', 15, 2); // Số tiền tối thiểu
            $table->decimal('max_amount', 15, 2)->nullable(); // Số tiền tối đa (null = không giới hạn)
            $table->decimal('fee_amount', 15, 2); // Phí cố định
            $table->decimal('fee_percentage', 5, 2)->default(0); // Phí theo phần trăm
            $table->decimal('daily_fee_percentage', 5, 2)->default(20); // Phí thêm mỗi ngày (%)
            $table->integer('points_reward'); // C thưởng
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['min_amount', 'max_amount', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaction_fees');
    }
};
