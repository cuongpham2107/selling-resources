<?php

namespace App\Actions\Fortify;

use App\Models\Customer;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\UpdatesUserPasswords;

class UpdateCustomerPassword implements UpdatesUserPasswords
{
    use PasswordValidationRules;

    /**
     * Validate and update the customer's password.
     *
     * @param  array<string, string>  $input
     */
    public function update($customer, array $input): void
    {
        Validator::make($input, [
            'current_password' => ['required', 'string', 'current_password:customer'],
            'password' => $this->passwordRules(),
        ], [
            'current_password.current_password' => __('The provided password does not match your current password.'),
        ])->validateWithBag('updatePassword');

        $customer->forceFill([
            'password' => Hash::make($input['password']),
        ])->save();
    }
}
