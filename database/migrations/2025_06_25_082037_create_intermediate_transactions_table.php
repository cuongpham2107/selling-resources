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
        Schema::create('intermediate_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_code', 20)->unique();
            $table->unsignedBigInteger('buyer_id');
            $table->unsignedBigInteger('seller_id');
            $table->text('description');
            $table->decimal('amount', 15, 2);
            $table->decimal('fee', 15, 2)->default(0);
            $table->integer('duration_hours');
            $table->enum('status', ['pending', 'confirmed', 'seller_sent', 'buyer_received', 'completed', 'disputed', 'cancelled', 'expired'])->default('pending');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('seller_sent_at')->nullable();
            $table->timestamp('buyer_received_at')->nullable();
            $table->timestamp('expires_at');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('buyer_id')->references('id')->on('customers')->onDelete('cascade');
            $table->foreign('seller_id')->references('id')->on('customers')->onDelete('cascade');
            $table->index(['status', 'expires_at']);
            $table->index('transaction_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('intermediate_transactions');
    }
};
