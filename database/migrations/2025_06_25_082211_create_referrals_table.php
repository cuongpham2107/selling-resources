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
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('referrer_id'); // Người giới thiệu
            $table->unsignedBigInteger('referred_id'); // Người được giới thiệu
            $table->decimal('total_points_earned', 15, 2)->default(0); // Tổng C đã nhận
            $table->integer('successful_transactions')->default(0); // Số giao dịch thành công
            $table->timestamp('first_transaction_at')->nullable(); // Giao dịch đầu tiên
            $table->timestamps();

            $table->foreign('referrer_id')->references('id')->on('customers')->onDelete('cascade');
            $table->foreign('referred_id')->references('id')->on('customers')->onDelete('cascade');
            $table->unique(['referrer_id', 'referred_id']);
            $table->index('referrer_id');
             $table->enum('status', ['active', 'inactive', 'pending'])->default('active')->after('referred_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};
