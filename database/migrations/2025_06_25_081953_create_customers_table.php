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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('username', 50)->unique();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->timestamp('password_changed_at')->nullable();
            $table->string('phone', 20)->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('referral_code', 20)->unique();
            $table->unsignedBigInteger('referred_by')->nullable();
            $table->timestamp('kyc_verified_at')->nullable();
            $table->json('kyc_data')->nullable();
            $table->rememberToken();
            $table->timestamps();

            $table->foreign('referred_by')->references('id')->on('customers')->onDelete('set null');
            $table->index([ 'is_active']);
            $table->index('referral_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
