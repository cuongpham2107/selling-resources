<?php

namespace Database\Factories;

use App\Models\StoreProduct;
use App\Models\PersonalStore;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StoreProduct>
 */
class StoreProductFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = StoreProduct::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'store_id' => PersonalStore::factory(),
            'name' => fake()->words(3, true),
            'description' => fake()->paragraph(),
            'images' => [
                fake()->imageUrl(640, 480, 'products'),
                fake()->imageUrl(640, 480, 'products'),
            ],
            'price' => fake()->randomFloat(2, 10, 1000),
            'content' => fake()->text(),
            'is_sold' => false,
            'is_active' => true,
            'is_deleted' => false,
            'deleted_by' => null,
            'sold_at' => null,
            'deleted_at' => null,
            'delete_reason' => null,
        ];
    }

    /**
     * Indicate that the product is sold.
     */
    public function sold(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_sold' => true,
            'sold_at' => now(),
        ]);
    }

    /**
     * Indicate that the product is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the product is deleted.
     */
    public function deleted(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_deleted' => true,
            'deleted_at' => now(),
            'delete_reason' => fake()->sentence(),
        ]);
    }

    /**
     * Set a specific store for the product.
     */
    public function forStore(PersonalStore $store): static
    {
        return $this->state(fn (array $attributes) => [
            'store_id' => $store->id,
        ]);
    }

    /**
     * Set a specific price for the product.
     */
    public function withPrice(float $price): static
    {
        return $this->state(fn (array $attributes) => [
            'price' => $price,
        ]);
    }
}
