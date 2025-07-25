<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Log;


class AppotaPayService
{
    protected $baseUrl;
    protected $secretKey;
    protected $partnerCode;
    protected $apiKey;

    public function __construct()
    {
        $this->baseUrl = config('appota.base_url');
        $this->secretKey = config('appota.secret_key');
        $this->partnerCode = config('appota.partner_code');
        $this->apiKey = config('appota.api_key');
    }

    protected function makeJwtToken()
    {
        $now = time();
        $payload = [
            'iss' => $this->partnerCode,
            'jti' => $this->apiKey . '-' . $now,
            'api_key' => $this->apiKey,
            'exp' => $now + 300,
        ];
        $header = [
            'typ' => 'JWT',
            'alg' => 'HS256',
            'cty' => 'appotapay-api;v=1',
        ];
        $jwt = JWT::encode($payload, $this->secretKey, 'HS256', null, $header);
        Log::info('AppotaPay JWT', [
            'jwt' => $jwt,
            'payload' => $payload,
            'header' => $header,
            'secret' => $this->secretKey,
        ]);
        return $jwt;
    }

    protected function sign(array $params)
    {
        // Danh sách các trường cần ký
        $fields = [
            'accountName', 'accountNo', 'accountType', 'amount', 'bankCode',
            'bankId', 'channel', 'contractNumber', 'customerPhoneNumber',
            'feeType', 'message', 'partnerRefId'
        ];

        $dataToSign = [];
        foreach ($fields as $field) {
            $dataToSign[$field] = $params[$field] ?? '';
        }
        ksort($dataToSign); // sort theo alphabet

        $raw = urldecode(http_build_query($dataToSign, '', '&', PHP_QUERY_RFC3986));

        Log::info('AppotaPay signature raw', [
            'raw' => $raw,
            'signature' => hash_hmac('sha256', $raw, $this->secretKey),
        ]);

        return hash_hmac('sha256', $raw, $this->secretKey);
    }

    public function transfer(array $data)
    {
        $jwt = $this->makeJwtToken();
        $fields = [
            'accountName', 'accountNo', 'accountType', 'amount', 'bankCode',
            'bankId', 'channel', 'contractNumber', 'customerPhoneNumber',
            'feeType', 'message', 'partnerRefId'
        ];
      
        foreach ($fields as $field) {
            $data[$field] = $data[$field] ?? '';
        }
        $data['signature'] = $this->sign($data);
      
        $response = Http::withHeaders([
            'X-APPOTAPAY-AUTH' => "Bearer {$jwt}",
            'Content-Type' => 'application/json',
        ])->post("{$this->baseUrl}/api/v1/service/transfer/make", $data);

        return $response->json();
    }
} 