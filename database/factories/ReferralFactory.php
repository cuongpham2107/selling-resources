<?php

namespace Database\Factories;

use App\Models\Referral;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Referral>
 */
class ReferralFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Referral::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'referrer_id' => Customer::factory(),
            'referred_id' => Customer::factory(),
            'status' => fake()->randomElement(['active', 'inactive', 'pending']),
            'total_points_earned' => fake()->numberBetween(0, 5000),
            'successful_transactions' => fake()->numberBetween(0, 50),
            'first_transaction_at' => fake()->optional()->dateTimeBetween('-1 year', 'now'),
        ];
    }

    /**
     * Indicate that the referral is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
        ]);
    }

    /**
     * Indicate that the referral is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }

    /**
     * Indicate that the referral is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'total_points_earned' => 0,
            'successful_transactions' => 0,
            'first_transaction_at' => null,
        ]);
    }

    /**
     * Set specific referrer and referred customers.
     */
    public function forCustomers(Customer $referrer, Customer $referred): static
    {
        return $this->state(fn (array $attributes) => [
            'referrer_id' => $referrer->id,
            'referred_id' => $referred->id,
        ]);
    }

    /**
     * Set as successful referral with transactions.
     */
    public function successful(): static
    {
        $transactions = fake()->numberBetween(1, 20);
        
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
            'total_points_earned' => $transactions * fake()->numberBetween(50, 200),
            'successful_transactions' => $transactions,
            'first_transaction_at' => fake()->dateTimeBetween('-6 months', '-1 month'),
        ]);
    }

    /**
     * Set specific points earned.
     */
    public function withPointsEarned(int $points): static
    {
        return $this->state(fn (array $attributes) => [
            'total_points_earned' => $points,
        ]);
    }

    /**
     * Set specific transaction count.
     */
    public function withTransactionCount(int $count): static
    {
        return $this->state(fn (array $attributes) => [
            'successful_transactions' => $count,
            'first_transaction_at' => $count > 0 ? fake()->dateTimeBetween('-1 year', 'now') : null,
        ]);
    }
}
