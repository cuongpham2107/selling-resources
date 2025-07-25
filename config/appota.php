<?php

return [
    'api_key' => env('APPOTA_API_KEY', ''),
    'secret_key' => env('APPOTA_SECRET_KEY', ''),
    'partner_code' => env('PARTNER_CODE', ''),
    'base_url' => env('APPOTA_API_URL', 'https://gateway.dev.appotapay.com'),
];