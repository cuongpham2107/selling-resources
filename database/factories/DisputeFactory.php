<?php

namespace Database\Factories;

use App\Models\Dispute;
use App\Models\Customer;
use App\Models\User;
use App\Enums\DisputeStatus;
use App\Enums\DisputeResult;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Dispute>
 */
class DisputeFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Dispute::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'transaction_type' => fake()->randomElement(['intermediate', 'store']),
            'transaction_id' => fake()->numberBetween(1, 1000),
            'created_by' => Customer::factory(),
            'reason' => fake()->text(200),
            'evidence' => [
                'images' => [
                    fake()->imageUrl(640, 480, 'evidence'),
                    fake()->imageUrl(640, 480, 'evidence'),
                ],
                'description' => fake()->paragraph(),
            ],
            'status' => fake()->randomElement(['pending', 'processing', 'resolved', 'cancelled']),
            'assigned_to' => null,
            'result' => null,
            'admin_notes' => null,
            'resolved_at' => null,
        ];
    }

    /**
     * Indicate that the dispute is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'assigned_to' => null,
            'result' => null,
            'admin_notes' => null,
            'resolved_at' => null,
        ]);
    }

    /**
     * Indicate that the dispute is processing.
     */
    public function processing(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'processing',
            'assigned_to' => Customer::factory(),
            'result' => null,
            'admin_notes' => fake()->paragraph(),
        ]);
    }

    /**
     * Indicate that the dispute is resolved.
     */
    public function resolved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'resolved',
            'assigned_to' => Customer::factory(),
            'result' => fake()->randomElement(['buyer_favor', 'seller_favor', 'partial_refund', 'no_action']),
            'admin_notes' => fake()->paragraph(),
            'resolved_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ]);
    }

    /**
     * Indicate that the dispute is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
            'result' => null,
            'admin_notes' => 'Dispute cancelled by creator',
            'resolved_at' => fake()->dateTimeBetween('-7 days', 'now'),
        ]);
    }

    /**
     * Set for intermediate transaction.
     */
    public function forIntermediateTransaction(int $transactionId): static
    {
        return $this->state(fn (array $attributes) => [
            'transaction_type' => 'intermediate',
            'transaction_id' => $transactionId,
        ]);
    }

    /**
     * Set for store transaction.
     */
    public function forStoreTransaction(int $transactionId): static
    {
        return $this->state(fn (array $attributes) => [
            'transaction_type' => 'store',
            'transaction_id' => $transactionId,
        ]);
    }

    /**
     * Set specific creator.
     */
    public function createdBy(Customer $customer): static
    {
        return $this->state(fn (array $attributes) => [
            'created_by' => $customer->id,
        ]);
    }

    /**
     * Set result in buyer's favor.
     */
    public function buyerFavor(): static
    {
        return $this->state(fn (array $attributes) => [
            'result' => 'buyer_favor',
            'status' => 'resolved',
            'resolved_at' => fake()->dateTimeBetween('-7 days', 'now'),
        ]);
    }

    /**
     * Set result in seller's favor.
     */
    public function sellerFavor(): static
    {
        return $this->state(fn (array $attributes) => [
            'result' => 'seller_favor',
            'status' => 'resolved',
            'resolved_at' => fake()->dateTimeBetween('-7 days', 'now'),
        ]);
    }
}
