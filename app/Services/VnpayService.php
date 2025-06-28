<?php

namespace App\Services;

use App\Models\WalletTransaction;
use Illuminate\Support\Facades\Config;

class VnpayService
{
    protected $vnp_TmnCode;
    protected $vnp_HashSecret;
    protected $vnp_Url;
    protected $vnp_ReturnUrl;
    protected $vnp_Locale;

    public function __construct()
    {
        $this->vnp_TmnCode = Config::get('vnpay.vnp_TmnCode');
        $this->vnp_HashSecret = Config::get('vnpay.vnp_HashSecret');
        $this->vnp_Url = Config::get('vnpay.vnp_Url');
        $this->vnp_ReturnUrl = Config::get('vnpay.vnp_ReturnUrl');
        $this->vnp_Locale = Config::get('vnpay.vnp_Locale');
    }

    /**
     * Tạo URL thanh toán VNPay
     */
    public function createPaymentUrl(WalletTransaction $transaction, $bankCode = null): string
    {
        $inputData = [
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $this->vnp_TmnCode,
            "vnp_Amount" => $transaction->amount * 100, // VNPay yêu cầu số tiền * 100
            "vnp_Command" => "pay",
            "vnp_CreateDate" => date('YmdHis'),
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => request()->ip(),
            "vnp_Locale" => $this->vnp_Locale,
            "vnp_OrderInfo" => $transaction->description ?: "Nap tien vao vi",
            "vnp_OrderType" => "billpayment",
            "vnp_ReturnUrl" => $this->vnp_ReturnUrl,
            "vnp_TxnRef" => $transaction->transaction_code,
        ];

        if ($bankCode) {
            $inputData['vnp_BankCode'] = $bankCode;
        }

        // Cập nhật vnpay_txn_ref vào transaction
        $transaction->update(['vnpay_txn_ref' => $transaction->transaction_code]);

        ksort($inputData);
        $query = "";
        $hashdata = "";
        $i = 0;

        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashdata .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashdata .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
            $query .= urlencode($key) . "=" . urlencode($value) . '&';
        }

        $vnp_Url = $this->vnp_Url . "?" . $query;
        
        if ($this->vnp_HashSecret) {
            $vnpSecureHash = hash_hmac('sha512', $hashdata, $this->vnp_HashSecret);
            $vnp_Url .= 'vnp_SecureHash=' . $vnpSecureHash;
        }

        return $vnp_Url;
    }

    /**
     * Xác thực callback từ VNPay
     */
    public function validateCallback(array $inputData): bool
    {
        $vnp_SecureHash = $inputData['vnp_SecureHash'] ?? '';
        unset($inputData['vnp_SecureHash']);
        unset($inputData['vnp_SecureHashType']);

        ksort($inputData);
        $hashData = "";
        $i = 0;

        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashData = $hashData . '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashData = $hashData . urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
        }

        $secureHash = hash_hmac('sha512', $hashData, $this->vnp_HashSecret);

        return $secureHash === $vnp_SecureHash;
    }

    /**
     * Xử lý kết quả thanh toán từ VNPay
     */
    public function processPaymentResult(array $responseData): array
    {
        $txnRef = $responseData['vnp_TxnRef'] ?? '';
        $responseCode = $responseData['vnp_ResponseCode'] ?? '';
        
        $transaction = WalletTransaction::where('vnpay_txn_ref', $txnRef)->first();
        
        if (!$transaction) {
            return [
                'success' => false,
                'message' => 'Không tìm thấy giao dịch',
                'transaction' => null
            ];
        }

        // Cập nhật thông tin phản hồi từ VNPay
        $transaction->updateVnpayResponse($responseData);

        if ($responseCode === '00') {
            // Thanh toán thành công
            $transaction->markAsCompleted();
            
            // Cập nhật số dư ví của khách hàng
            $this->updateCustomerBalance($transaction);
            
            return [
                'success' => true,
                'message' => 'Thanh toán thành công',
                'transaction' => $transaction
            ];
        } else {
            // Thanh toán thất bại
            $transaction->markAsFailed($this->getErrorMessage($responseCode));
            
            return [
                'success' => false,
                'message' => $this->getErrorMessage($responseCode),
                'transaction' => $transaction
            ];
        }
    }

    /**
     * Cập nhật số dư ví của khách hàng sau khi nạp tiền thành công
     */
    protected function updateCustomerBalance(WalletTransaction $transaction): void
    {
        if ($transaction->type === 'deposit' && $transaction->isCompleted()) {
            $customerBalance = $transaction->customer->balance ?? new \App\Models\CustomerBalance(['customer_id' => $transaction->customer_id]);
            
            if (!$customerBalance->exists) {
                $customerBalance->balance = 0;
                $customerBalance->locked_balance = 0;
                $customerBalance->save();
            }
            
            $customerBalance->increment('balance', $transaction->net_amount);
        }
    }

    /**
     * Lấy thông báo lỗi từ mã phản hồi VNPay
     */
    protected function getErrorMessage(string $responseCode): string
    {
        $errorMessages = [
            '07' => 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
            '09' => 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
            '10' => 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
            '11' => 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
            '12' => 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
            '13' => 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
            '24' => 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
            '51' => 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
            '65' => 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
            '75' => 'Ngân hàng thanh toán đang bảo trì.',
            '79' => 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
            '99' => 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)'
        ];

        return $errorMessages[$responseCode] ?? 'Giao dịch không thành công do lỗi không xác định.';
    }

    /**
     * Xử lý phản hồi từ VNPay khi người dùng quay lại
     */
    public function processReturn(array $responseData): array
    {
        // Validate hash
        if (!$this->validateCallback($responseData)) {
            return [
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ từ VNPay',
                'vnp_TxnRef' => $responseData['vnp_TxnRef'] ?? '',
                'vnp_ResponseCode' => $responseData['vnp_ResponseCode'] ?? '',
            ];
        }

        return [
            'success' => true,
            'message' => 'Dữ liệu hợp lệ',
            'vnp_TxnRef' => $responseData['vnp_TxnRef'] ?? '',
            'vnp_ResponseCode' => $responseData['vnp_ResponseCode'] ?? '',
            'vnp_TransactionNo' => $responseData['vnp_TransactionNo'] ?? '',
            'vnp_Amount' => $responseData['vnp_Amount'] ?? '',
            'vnp_OrderInfo' => $responseData['vnp_OrderInfo'] ?? '',
            'vnp_PayDate' => $responseData['vnp_PayDate'] ?? '',
        ];
    }

    /**
     * Xử lý callback IPN từ VNPay
     */
    public function processCallback(array $responseData): array
    {
        // Validate hash
        if (!$this->validateCallback($responseData)) {
            return [
                'success' => false,
                'message' => 'Invalid signature',
                'vnp_TxnRef' => $responseData['vnp_TxnRef'] ?? '',
                'vnp_ResponseCode' => $responseData['vnp_ResponseCode'] ?? '',
            ];
        }

        return [
            'success' => true,
            'message' => 'Valid signature',
            'vnp_TxnRef' => $responseData['vnp_TxnRef'] ?? '',
            'vnp_ResponseCode' => $responseData['vnp_ResponseCode'] ?? '',
            'vnp_TransactionNo' => $responseData['vnp_TransactionNo'] ?? '',
            'vnp_Amount' => $responseData['vnp_Amount'] ?? '',
            'vnp_OrderInfo' => $responseData['vnp_OrderInfo'] ?? '',
            'vnp_PayDate' => $responseData['vnp_PayDate'] ?? '',
        ];
    }
}
