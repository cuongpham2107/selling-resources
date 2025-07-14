<?php

namespace Database\Factories;

use App\Models\IntermediateTransaction;
use App\Models\Customer;
use App\Enums\IntermediateTransactionStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\IntermediateTransaction>
 */
class IntermediateTransactionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = IntermediateTransaction::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $amount = fake()->numberBetween(100000, 10000000); // 100k to 10M VND
        $fee = $amount * 0.02; // 2% fee

        return [
            'transaction_code' => strtoupper(fake()->regexify('[A-Z0-9]{10}')),
            'buyer_id' => Customer::factory(),
            'seller_id' => Customer::factory(),
            'description' => fake()->sentence(),
            'amount' => $amount,
            'fee' => $fee,
            'duration_hours' => fake()->numberBetween(24, 168), // 1-7 days
            'status' => fake()->randomElement([
                IntermediateTransactionStatus::PENDING,
                IntermediateTransactionStatus::CONFIRMED,
                IntermediateTransactionStatus::COMPLETED,
            ]),
            'confirmed_at' => null,
            'seller_sent_at' => null,
            'buyer_received_at' => null,
            'expires_at' => fake()->dateTimeBetween('now', '+7 days'),
            'completed_at' => null,
        ];
    }

    /**
     * Indicate that the transaction is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => IntermediateTransactionStatus::PENDING,
            'confirmed_at' => null,
            'seller_sent_at' => null,
            'buyer_received_at' => null,
            'completed_at' => null,
        ]);
    }

    /**
     * Indicate that the transaction is confirmed.
     */
    public function confirmed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => IntermediateTransactionStatus::CONFIRMED,
            'confirmed_at' => fake()->dateTimeBetween('-1 day', 'now'),
        ]);
    }

    /**
     * Indicate that the transaction is completed.
     */
    public function completed(): static
    {
        $confirmedAt = fake()->dateTimeBetween('-7 days', '-3 days');
        $sellerSentAt = fake()->dateTimeBetween($confirmedAt, '-2 days');
        $buyerReceivedAt = fake()->dateTimeBetween($sellerSentAt, '-1 day');
        $completedAt = fake()->dateTimeBetween($buyerReceivedAt, 'now');

        return $this->state(fn (array $attributes) => [
            'status' => IntermediateTransactionStatus::COMPLETED,
            'confirmed_at' => $confirmedAt,
            'seller_sent_at' => $sellerSentAt,
            'buyer_received_at' => $buyerReceivedAt,
            'completed_at' => $completedAt,
        ]);
    }

    /**
     * Indicate that the transaction is disputed.
     */
    public function disputed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => IntermediateTransactionStatus::DISPUTED,
            'confirmed_at' => fake()->dateTimeBetween('-7 days', '-1 day'),
        ]);
    }

    /**
     * Set specific buyer and seller.
     */
    public function forCustomers(Customer $buyer, Customer $seller): static
    {
        return $this->state(fn (array $attributes) => [
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
        ]);
    }

    /**
     * Set specific amount.
     */
    public function withAmount(float $amount): static
    {
        return $this->state(fn (array $attributes) => [
            'amount' => $amount,
            'fee' => $amount * 0.02,
        ]);
    }
}
