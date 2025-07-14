<?php

namespace Database\Factories;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Customer>
 */
class CustomerFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Customer::class;

    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'username' => fake()->unique()->userName(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'phone' => fake()->optional()->phoneNumber(),
            'is_active' => true,
            'referral_code' => Str::upper(Str::random(8)),
            'referred_by' => null,
            'kyc_verified_at' => null,
            'kyc_data' => null,
            'remember_token' => Str::random(10),
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
            'password_changed_at' => now(),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the customer should be inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the customer should be KYC verified.
     */
    public function kycVerified(): static
    {
        return $this->state(fn (array $attributes) => [
            'kyc_verified_at' => now(),
            'kyc_data' => [
                'document_type' => 'passport',
                'document_number' => fake()->randomNumber(9),
                'verified_by' => 'system',
            ],
        ]);
    }

    /**
     * Indicate that the customer has two-factor authentication enabled.
     */
    public function withTwoFactor(): static
    {
        return $this->state(fn (array $attributes) => [
            'two_factor_secret' => 'test-secret',
            'two_factor_recovery_codes' => json_encode(['recovery1', 'recovery2']),
            'two_factor_confirmed_at' => now(),
        ]);
    }

    /**
     * Set a specific referral code.
     */
    public function withReferralCode(string $code): static
    {
        return $this->state(fn (array $attributes) => [
            'referral_code' => $code,
        ]);
    }

    /**
     * Set a referrer.
     */
    public function referredBy(Customer $referrer): static
    {
        return $this->state(fn (array $attributes) => [
            'referred_by' => $referrer->id,
        ]);
    }
}
