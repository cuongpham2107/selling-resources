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
        Schema::create('store_products', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('store_id');
            $table->string('name', 200);
            $table->text('description');
            $table->json('images')->nullable(); // Array đường dẫn ảnh
            $table->decimal('price', 15, 2);
            $table->text('content'); // Nội dung sản phẩm (account, key, ...)
            $table->boolean('is_sold')->default(false);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_deleted')->default(false);
            $table->unsignedBigInteger('deleted_by')->nullable(); // Admin/moderator xóa
            $table->timestamp('deleted_at')->nullable();
            $table->text('delete_reason')->nullable();
            $table->timestamps();

            $table->foreign('store_id')->references('id')->on('personal_stores')->onDelete('cascade');
            $table->foreign('deleted_by')->references('id')->on('customers')->onDelete('set null');
            $table->index(['store_id', 'is_sold', 'is_active', 'is_deleted']);
            $table->index('price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('store_products');
    }
};
