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
        // Migration này chỉ để seed dữ liệu, nhưng đã chuyển sang seeder
        // Bỏ trống vì dữ liệu đã được chuyển sang TransactionFeesSeeder
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Không cần làm gì
    }
};
