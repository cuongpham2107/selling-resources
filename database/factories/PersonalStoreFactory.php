<?php

namespace Database\Factories;

use App\Models\PersonalStore;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PersonalStore>
 */
class PersonalStoreFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = PersonalStore::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'owner_id' => Customer::factory(),
            'store_name' => fake()->company(),
            'description' => fake()->paragraph(),
            'avatar' => null,
            'is_active' => true,
            'is_verified' => fake()->boolean(30), // 30% chance of being verified
            'is_locked' => false,
            'locked_by' => null,
            'locked_at' => null,
            'lock_reason' => null,
            'rating' => fake()->randomFloat(2, 0, 5),
            'total_sales' => fake()->numberBetween(0, 1000),
            'total_products' => fake()->numberBetween(0, 50),
        ];
    }

    /**
     * Indicate that the store is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the store is verified.
     */
    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_verified' => true,
        ]);
    }

    /**
     * Indicate that the store is locked.
     */
    public function locked(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_locked' => true,
            'locked_at' => now(),
            'lock_reason' => fake()->sentence(),
        ]);
    }

    /**
     * Set a specific owner for the store.
     */
    public function ownedBy(Customer $customer): static
    {
        return $this->state(fn (array $attributes) => [
            'owner_id' => $customer->id,
        ]);
    }
}
