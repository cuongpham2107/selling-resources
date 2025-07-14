<?php

namespace App\Console\Commands;

use App\Models\IntermediateTransaction;
use App\Models\WalletTransaction;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Process Expired Transactions Command
 * 
 * Xử lý các giao dịch trung gian đã hết hạn theo yêu cầu README:
 * "Khi hết thời gian giao dịch: Hệ thống chờ thêm 1 giờ. 
 * Nếu không có xác nhận hoặc tranh chấp → huỷ đơn, hoàn tiền người mua (trừ phí)."
 */
class ProcessExpiredTransactions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'transactions:process-expired 
                            {--dry-run : Run without making changes}
                            {--limit=100 : Maximum number of transactions to process}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process expired intermediate transactions and refund buyers (minus fees)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dryRun = $this->option('dry-run');
        $limit = (int) $this->option('limit');

        $this->info('Starting expired transactions processing...');
        
        if ($dryRun) {
            $this->warn('DRY RUN MODE - No changes will be made');
        }

        // Tìm giao dịch hết hạn + grace period 1h
        $expiredTransactions = IntermediateTransaction::where('expires_at', '<', now()->subHour())
            ->whereIn('status', [
                'App\\States\\IntermediateTransaction\\PendingState',
                'App\\States\\IntermediateTransaction\\ConfirmedState',
                'App\\States\\IntermediateTransaction\\SellerSentState'
            ])
            ->limit($limit)
            ->get();

        if ($expiredTransactions->isEmpty()) {
            $this->info('No expired transactions found.');
            return self::SUCCESS;
        }

        $this->info("Found {$expiredTransactions->count()} expired transactions to process.");

        $processed = 0;
        $errors = 0;

        foreach ($expiredTransactions as $transaction) {
            try {
                if ($dryRun) {
                    $this->line("Would process transaction #{$transaction->id} - Amount: {$transaction->amount}, Fee: {$transaction->fee}");
                } else {
                    $this->cancelExpiredTransaction($transaction);
                    $this->line("✓ Processed transaction #{$transaction->id}");
                }
                $processed++;
            } catch (\Exception $e) {
                $this->error("✗ Failed to process transaction #{$transaction->id}: {$e->getMessage()}");
                Log::error("Failed to process expired transaction {$transaction->id}", [
                    'error' => $e->getMessage(),
                    'transaction' => $transaction->toArray()
                ]);
                $errors++;
            }
        }

        $this->info("Processing completed:");
        $this->info("- Processed: {$processed}");
        if ($errors > 0) {
            $this->error("- Errors: {$errors}");
        }

        return $errors > 0 ? self::FAILURE : self::SUCCESS;
    }

    /**
     * Cancel expired transaction and refund buyer (minus fee)
     * 
     * @param IntermediateTransaction $transaction
     * @return void
     */
    private function cancelExpiredTransaction(IntermediateTransaction $transaction): void
    {
        DB::transaction(function () use ($transaction) {
            // Hoàn tiền cho buyer (trừ phí - phí bị mất do hết hạn)
            $refundAmount = $transaction->amount; // Phí không được hoàn lại
            $buyer = $transaction->buyer;
            
            // Cập nhật số dư buyer
            $buyer->increment('wallet_balance', $refundAmount);
            
            // Giảm locked balance
            if ($buyer->balance) {
                $buyer->balance->decrement('locked_balance', $transaction->amount + $transaction->fee);
            }

            // Tạo wallet transaction record cho buyer
            WalletTransaction::create([
                'customer_id' => $buyer->id,
                'type' => 'credit',
                'transaction_type' => 'expired_refund',
                'amount' => $refundAmount,
                'description' => "Hoàn tiền giao dịch hết hạn #{$transaction->id} (phí {$transaction->fee} VNĐ bị mất)",
                'reference_id' => $transaction->id,
                'status' => 'completed',
            ]);

            // Update transaction status to expired using state machine
            $transaction->status()->transitionTo(\App\States\IntermediateTransaction\ExpiredState::class);
            $transaction->update([
                'completed_at' => now(),
            ]);

            Log::info("Expired transaction {$transaction->id} processed", [
                'buyer_id' => $buyer->id,
                'refund_amount' => $refundAmount,
                'fee_lost' => $transaction->fee,
                'original_amount' => $transaction->amount
            ]);
        });
    }
}