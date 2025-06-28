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
        Schema::create('personal_stores', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('owner_id');
            $table->string('store_name', 100);
            $table->text('description')->nullable();
            $table->string('avatar')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_locked')->default(false);
            $table->unsignedBigInteger('locked_by')->nullable(); // Admin/moderator khóa
            $table->timestamp('locked_at')->nullable();
            $table->text('lock_reason')->nullable();
            $table->decimal('rating', 3, 2)->default(0.00); // Rating từ 0.00 đến 5.00
            $table->unsignedInteger('total_sales')->default(0);
            $table->unsignedInteger('total_products')->default(0);
            $table->timestamps();

            $table->foreign('owner_id')->references('id')->on('customers')->onDelete('cascade');
            $table->foreign('locked_by')->references('id')->on('customers')->onDelete('set null');
            $table->unique('owner_id');
            $table->index(['is_active', 'is_locked']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personal_stores');
    }
};
