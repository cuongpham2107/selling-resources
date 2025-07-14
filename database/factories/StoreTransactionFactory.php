<?php

namespace Database\Factories;

use App\Models\StoreTransaction;
use App\Models\Customer;
use App\Models\StoreProduct;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StoreTransaction>
 */
class StoreTransactionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = StoreTransaction::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $amount = fake()->numberBetween(50000, 5000000); // 50k to 5M VND
        $fee = $amount * 0.01; // 1% fee

        return [
            'transaction_code' => strtoupper(fake()->regexify('[A-Z0-9]{10}')),
            'buyer_id' => Customer::factory(),
            'seller_id' => Customer::factory(),
            'product_id' => StoreProduct::factory(),
            'amount' => $amount,
            'fee' => $fee,
            'status' => fake()->randomElement(['processing', 'completed', 'disputed', 'cancelled']),
            'completed_at' => null,
            'auto_complete_at' => fake()->dateTimeBetween('now', '+3 days'),
            'buyer_early_complete' => false,
        ];
    }

    /**
     * Indicate that the transaction is processing.
     */
    public function processing(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'processing',
            'completed_at' => null,
            'auto_complete_at' => fake()->dateTimeBetween('now', '+3 days'),
        ]);
    }

    /**
     * Indicate that the transaction is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'completed_at' => fake()->dateTimeBetween('-7 days', 'now'),
            'auto_complete_at' => fake()->dateTimeBetween('-10 days', '-7 days'),
        ]);
    }

    /**
     * Indicate that the transaction is disputed.
     */
    public function disputed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'disputed',
            'completed_at' => null,
        ]);
    }

    /**
     * Indicate that the transaction is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
            'completed_at' => null,
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
     * Set specific product.
     */
    public function forProduct(StoreProduct $product): static
    {
        return $this->state(fn (array $attributes) => [
            'product_id' => $product->id,
            'seller_id' => $product->personal_store->customer_id,
        ]);
    }

    /**
     * Set specific amount.
     */
    public function withAmount(float $amount): static
    {
        return $this->state(fn (array $attributes) => [
            'amount' => $amount,
            'fee' => $amount * 0.01,
        ]);
    }

    /**
     * Indicate buyer early complete.
     */
    public function buyerEarlyComplete(): static
    {
        return $this->state(fn (array $attributes) => [
            'buyer_early_complete' => true,
        ]);
    }
}
