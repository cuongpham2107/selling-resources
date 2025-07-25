<?php

namespace App\Http\Controllers;

use App\Services\AppotaPayService;
use Illuminate\Http\Request;

class BankTransferController extends Controller
{
    protected $api;

    public function __construct(AppotaPayService $api)
    {
        $this->api = $api;
    }

    public function send(Request $req)
    {
        $req->validate([
            'bankCode'=>'required|string',
            'accountNo'=>'required|string',
            'accountType'=>'required|in:account,card',
            'accountName'=>'required|string',
            'amount'=>'required|integer|min:1000',
        ]);

        $partnerRefId = 'REG-'.time();
        $data = [
            'bankCode'=>$req->bankCode,
            'bankId' => $req->bankId,
            'accountNo'=>$req->accountNo,
            'accountType'=>$req->accountType,
            'accountName'=>$req->accountName,   
            'amount'=>$req->amount,
            'feeType'=>'payer',
            'partnerRefId'=>$partnerRefId,
            'message'=>$req->message ?? '',
            'channel'=> "citad",
            'customerPhoneNumber'=>$req->customerPhoneNumber ?? '',
            'contractNumber'=> $req->contractNumber ?? '1234567'
        ];

        $result = $this->api->transfer($data);

        if (($result['errorCode'] ?? -1) == 0) {
            return response()->json([
                'success' => true,
                'transaction' => $result['transaction'] ?? $result
            ]);
        }

        return response()->json([
            'success' => false,
            'errorCode' => $result['errorCode'] ?? '',
            'message' => $result['message'] ?? 'Unknown error'
        ], 400);
    }
} 