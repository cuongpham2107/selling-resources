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
        // Tạo bảng này sau khi tạo bảng store_products
        Schema::create('general_chats', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sender_id');
            $table->text('message');
            $table->boolean('is_deleted')->default(false);
            $table->unsignedBigInteger('deleted_by')->nullable(); // Admin/moderator xóa
            $table->timestamp('deleted_at')->nullable();
            $table->timestamps();
            $table->unsignedBigInteger('attached_product_id')->nullable();

            $table->foreign('attached_product_id')->references('id')->on('store_products')->onDelete('set null');

            $table->foreign('sender_id')->references('id')->on('customers')->onDelete('cascade');
            $table->foreign('deleted_by')->references('id')->on('customers')->onDelete('set null');
            $table->index(['created_at', 'is_deleted']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('general_chats');
    }
};
