<?php

return [
    /*
    |--------------------------------------------------------------------------
    | JWT Secret Key
    |--------------------------------------------------------------------------
    |
    | This key is used to sign your JWT tokens. Make sure to set this in your
    | .env file as JWT_SECRET. This should be a long, random string.
    |
    */
    'secret' => env('JWT_SECRET', 'your-super-secret-jwt-key-change-this-in-production'),

    /*
    |--------------------------------------------------------------------------
    | JWT Algorithm
    |--------------------------------------------------------------------------
    |
    | The algorithm used to sign the token. Supported algorithms are:
    | HS256, HS384, HS512, RS256, RS384, RS512, ES256, ES384, ES512
    |
    */
    'algorithm' => env('JWT_ALGORITHM', 'HS256'),

    /*
    |--------------------------------------------------------------------------
    | Token Expiration Time
    |--------------------------------------------------------------------------
    |
    | Default expiration time for tokens in seconds (1 hour = 3600 seconds)
    |
    */
    'ttl' => env('JWT_TTL', 3600),

    /*
    |--------------------------------------------------------------------------
    | Refresh Token Expiration Time
    |--------------------------------------------------------------------------
    |
    | Default expiration time for refresh tokens in seconds (7 days = 604800 seconds)
    |
    */
    'refresh_ttl' => env('JWT_REFRESH_TTL', 604800),

    /*
    |--------------------------------------------------------------------------
    | Token Issuer
    |--------------------------------------------------------------------------
    |
    | The issuer of the token, typically your application name or URL
    |
    */
    'issuer' => env('JWT_ISSUER', config('app.name', 'Laravel')),
];