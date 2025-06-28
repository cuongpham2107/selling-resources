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
        Schema::create('transaction_chats', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('transaction_id');
            $table->string('transaction_type'); // 'intermediate' hoặc 'store'
            $table->unsignedBigInteger('sender_id');
            $table->text('message');
            $table->json('images')->nullable(); // Array các đường dẫn ảnh
            $table->boolean('is_deleted')->default(false);
            $table->timestamps();

            $table->foreign('sender_id')->references('id')->on('customers')->onDelete('cascade');
            $table->index(['transaction_id', 'transaction_type']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaction_chats');
    }
};
