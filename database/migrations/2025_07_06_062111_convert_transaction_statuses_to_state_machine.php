<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Disable foreign key checks
        Schema::disableForeignKeyConstraints();
        
        // Change status columns from enum to string to support state machine
        $this->changeStatusColumnsToString();
        
        // Convert IntermediateTransaction statuses from enum to state machine
        $this->convertIntermediateTransactionStatuses();
        
        // Convert StoreTransaction statuses from enum to state machine
        $this->convertStoreTransactionStatuses();
        
        // Re-enable foreign key checks
        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert IntermediateTransaction statuses back to enum
        $this->revertIntermediateTransactionStatuses();
        
        // Revert StoreTransaction statuses back to enum
        $this->revertStoreTransactionStatuses();
    }

    /**
     * Change status columns from enum to string to support state machine class names
     */
    private function changeStatusColumnsToString(): void
    {
        // Change intermediate_transactions status column
        if (Schema::hasColumn('intermediate_transactions', 'status')) {
            Schema::table('intermediate_transactions', function (Blueprint $table) {
                $table->string('status', 255)->change();
            });
        }
        
        // Change store_transactions status column
        if (Schema::hasColumn('store_transactions', 'status')) {
            Schema::table('store_transactions', function (Blueprint $table) {
                $table->string('status', 255)->change();
            });
        }
    }

    /**
     * Convert IntermediateTransaction statuses to state machine format
     */
    private function convertIntermediateTransactionStatuses(): void
    {
        $statusMapping = [
            'pending' => 'App\\States\\IntermediateTransaction\\PendingState',
            'confirmed' => 'App\\States\\IntermediateTransaction\\ConfirmedState',
            'seller_sent' => 'App\\States\\IntermediateTransaction\\SellerSentState',
            'buyer_received' => 'App\\States\\IntermediateTransaction\\SellerSentState', // Chờ buyer confirm
            'completed' => 'App\\States\\IntermediateTransaction\\CompletedState',
            'disputed' => 'App\\States\\IntermediateTransaction\\DisputedState',
            'cancelled' => 'App\\States\\IntermediateTransaction\\CancelledState',
        ];

        foreach ($statusMapping as $oldStatus => $newStatus) {
            DB::table('intermediate_transactions')
                ->where('status', $oldStatus)
                ->update(['status' => $newStatus]);
        }

        // Handle any unknown statuses by setting them to pending
        $knownStatuses = array_values($statusMapping);
        DB::table('intermediate_transactions')
            ->whereNotIn('status', $knownStatuses)
            ->update(['status' => 'App\\States\\IntermediateTransaction\\PendingState']);
    }

    /**
     * Convert StoreTransaction statuses to state machine format
     */
    private function convertStoreTransactionStatuses(): void
    {
        $statusMapping = [
            'processing' => 'App\\States\\StoreTransaction\\ProcessingState',
            'completed' => 'App\\States\\StoreTransaction\\CompletedState',
            'disputed' => 'App\\States\\StoreTransaction\\DisputedState',
            'cancelled' => 'App\\States\\StoreTransaction\\CancelledState',
        ];

        foreach ($statusMapping as $oldStatus => $newStatus) {
            DB::table('store_transactions')
                ->where('status', $oldStatus)
                ->update(['status' => $newStatus]);
        }

        // Handle any unknown statuses by setting them to processing
        $knownStatuses = array_values($statusMapping);
        DB::table('store_transactions')
            ->whereNotIn('status', $knownStatuses)
            ->update(['status' => 'App\\States\\StoreTransaction\\ProcessingState']);
    }

    /**
     * Revert IntermediateTransaction statuses back to enum format
     */
    private function revertIntermediateTransactionStatuses(): void
    {
        $statusMapping = [
            'App\\States\\IntermediateTransaction\\PendingState' => 'pending',
            'App\\States\\IntermediateTransaction\\ConfirmedState' => 'confirmed',
            'App\\States\\IntermediateTransaction\\SellerSentState' => 'seller_sent',
            'App\\States\\IntermediateTransaction\\CompletedState' => 'completed',
            'App\\States\\IntermediateTransaction\\DisputedState' => 'disputed',
            'App\\States\\IntermediateTransaction\\CancelledState' => 'cancelled',
        ];

        foreach ($statusMapping as $newStatus => $oldStatus) {
            DB::table('intermediate_transactions')
                ->where('status', $newStatus)
                ->update(['status' => $oldStatus]);
        }
    }

    /**
     * Revert StoreTransaction statuses back to enum format
     */
    private function revertStoreTransactionStatuses(): void
    {
        $statusMapping = [
            'App\\States\\StoreTransaction\\ProcessingState' => 'processing',
            'App\\States\\StoreTransaction\\CompletedState' => 'completed',
            'App\\States\\StoreTransaction\\DisputedState' => 'disputed',
            'App\\States\\StoreTransaction\\CancelledState' => 'cancelled',
        ];

        foreach ($statusMapping as $newStatus => $oldStatus) {
            DB::table('store_transactions')
                ->where('status', $newStatus)
                ->update(['status' => $oldStatus]);
        }
    }
};
