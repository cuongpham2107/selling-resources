<?php

namespace Database\Factories;

use App\Models\PointTransaction;
use App\Models\Customer;
use App\Enums\PointTransactionType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PointTransaction>
 */
class PointTransactionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = PointTransaction::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'type' => fake()->randomElement([
                PointTransactionType::EARNED,
                PointTransactionType::REFERRAL_BONUS,
                PointTransactionType::EXCHANGE_IN,
                PointTransactionType::EXCHANGE_OUT,
                PointTransactionType::ADMIN_ADJUST,
            ]),
            'points' => fake()->numberBetween(10, 1000),
            'source' => fake()->randomElement(['daily_login', 'referral', 'exchange', 'admin']),
            'description' => fake()->sentence(),
            'target_customer_id' => null,
            'admin_id' => null,
        ];
    }

    /**
     * Indicate that this is a daily login transaction.
     */
    public function dailyLogin(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => PointTransactionType::EARNED,
            'source' => 'daily_login',
            'points' => fake()->numberBetween(10, 50),
            'description' => 'Daily login bonus',
        ]);
    }

    /**
     * Indicate that this is a referral bonus transaction.
     */
    public function referralBonus(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => PointTransactionType::REFERRAL_BONUS,
            'source' => 'referral',
            'points' => fake()->numberBetween(100, 500),
            'description' => 'Referral bonus',
            'target_customer_id' => Customer::factory(),
        ]);
    }

    /**
     * Indicate that this is an exchange transaction.
     */
    public function exchange(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => fake()->randomElement([
                PointTransactionType::EXCHANGE_IN,
                PointTransactionType::EXCHANGE_OUT,
            ]),
            'source' => 'exchange',
            'description' => 'Points exchange',
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

    /**
     * Set specific points amount.
     */
    public function withPoints(int $points): static
    {
        return $this->state(fn (array $attributes) => [
            'points' => $points,
        ]);
    }
}
