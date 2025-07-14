<?php

namespace Database\Factories;

use App\Models\CustomerPoint;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CustomerPoint>
 */
class CustomerPointFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = CustomerPoint::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'points' => fake()->numberBetween(0, 10000),
        ];
    }

    /**
     * Indicate that the customer has no points.
     */
    public function noPoints(): static
    {
        return $this->state(fn (array $attributes) => [
            'points' => 0,
        ]);
    }

    /**
     * Indicate that the customer has specific points.
     */
    public function withPoints(int $points): static
    {
        return $this->state(fn (array $attributes) => [
            'points' => $points,
        ]);
    }
}
