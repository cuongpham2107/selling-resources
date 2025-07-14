<?php

namespace Database\Factories;

use App\Models\CustomerBalance;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CustomerBalance>
 */
class CustomerBalanceFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = CustomerBalance::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'balance' => fake()->randomFloat(2, 0, 10000),
            'locked_balance' => fake()->randomFloat(2, 0, 1000),
        ];
    }

    /**
     * Indicate that the customer has no balance.
     */
    public function noBalance(): static
    {
        return $this->state(fn (array $attributes) => [
            'balance' => 0,
            'locked_balance' => 0,
        ]);
    }

    /**
     * Indicate that the customer has a specific balance.
     */
    public function withBalance(float $balance): static
    {
        return $this->state(fn (array $attributes) => [
            'balance' => $balance,
        ]);
    }
}
