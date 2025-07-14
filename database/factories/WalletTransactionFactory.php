<?php

namespace Database\Factories;

use App\Models\WalletTransaction;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WalletTransaction>
 */
class WalletTransactionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = WalletTransaction::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $amount = fake()->randomFloat(2, 10, 1000);
        $fee = $amount * 0.02; // 2% fee
        
        return [
            'transaction_code' => 'WT-' . Str::upper(Str::random(8)),
            'customer_id' => Customer::factory(),
            'type' => fake()->randomElement(['deposit', 'withdrawal', 'transfer_in', 'transfer_out']),
            'amount' => $amount,
            'fee' => $fee,
            'net_amount' => $amount - $fee,
            'status' => fake()->randomElement(['pending', 'completed', 'failed', 'cancelled']),
            'payment_method' => fake()->randomElement(['vnpay', 'bank_transfer', 'wallet']),
            'description' => fake()->sentence(),
            'vnpay_txn_ref' => null,
            'vnpay_transaction_no' => null,
            'vnpay_bank_code' => null,
            'vnpay_response_code' => null,
            'vnpay_response' => null,
            'withdrawal_info' => null,
            'recipient_id' => null,
            'sender_id' => null,
            'note' => fake()->optional()->sentence(),
            'processed_at' => null,
        ];
    }

    /**
     * Indicate that the transaction is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'processed_at' => now(),
        ]);
    }

    /**
     * Indicate that the transaction is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'processed_at' => null,
        ]);
    }

    /**
     * Indicate that this is a deposit transaction.
     */
    public function deposit(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'deposit',
            'payment_method' => 'vnpay',
        ]);
    }

    /**
     * Indicate that this is a withdrawal transaction.
     */
    public function withdrawal(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'withdrawal',
            'payment_method' => 'bank_transfer',
        ]);
    }

    /**
     * Indicate that this is a transfer in transaction.
     */
    public function transferIn(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'transfer_in',
            'payment_method' => 'wallet',
            'sender_id' => Customer::factory(),
        ]);
    }

    /**
     * Indicate that this is a transfer out transaction.
     */
    public function transferOut(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'transfer_out',
            'payment_method' => 'wallet',
            'recipient_id' => Customer::factory(),
        ]);
    }

    /**
     * Set a specific customer for the transaction.
     */
    public function forCustomer(Customer $customer): static
    {
        return $this->state(fn (array $attributes) => [
            'customer_id' => $customer->id,
        ]);
    }
}
