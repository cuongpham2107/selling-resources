<?php

return [
    'vnp_Url' => env('VNP_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'),
    'vnp_ReturnUrl' => env('VNP_RETURN_URL', 'http://localhost:8000/customer/wallet/vnpay/return'),
    'vnp_TmnCode' => env('VNP_TMNCODE', 'YOUR_TMN_CODE'),
    'vnp_HashSecret' => env('VNP_HASHSECRET', 'YOUR_HASH_SECRET'),
    'vnp_Locale' => env('VNP_LOCALE', 'vn'), // vn, en
];