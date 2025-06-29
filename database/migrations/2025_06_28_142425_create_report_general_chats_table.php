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
        Schema::create('report_general_chats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('general_chat_id')->constrained('general_chats')->onDelete('cascade');
            $table->foreignId('reporter_id')->constrained('customers')->onDelete('cascade');
            $table->string('reason'); // Lý do báo cáo: spam, inappropriate, harassment, etc.
            $table->text('description')->nullable(); // Mô tả chi tiết về vi phạm
            $table->enum('status', ['pending', 'reviewing', 'resolved', 'rejected'])->default('pending');
            $table->foreignId('handled_by')->nullable()->constrained('users')->onDelete('set null'); // Admin xử lý
            $table->text('admin_note')->nullable(); // Ghi chú của admin
            $table->timestamp('handled_at')->nullable(); // Thời gian xử lý
            $table->timestamps();

            // Indexes
            $table->index(['general_chat_id', 'reporter_id']);
            $table->index('status');
            $table->index('created_at');
            
            // Prevent duplicate reports from same user for same message
            $table->unique(['general_chat_id', 'reporter_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_general_chats');
    }
};
