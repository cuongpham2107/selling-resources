<div class="space-y-6">
    <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Chi tiết giao dịch</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <dt class="text-sm font-medium text-gray-500">Mã giao dịch</dt>
                <dd class="mt-1 text-sm text-gray-900 font-mono">{{ $record->transaction_code }}</dd>
            </div>
            
            <div>
                <dt class="text-sm font-medium text-gray-500">Khách hàng</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ $record->customer->username ?? 'N/A' }}</dd>
            </div>
            
            <div>
                <dt class="text-sm font-medium text-gray-500">Loại giao dịch</dt>
                <dd class="mt-1">
                    @php
                        $typeColors = [
                            'deposit' => 'bg-blue-100 text-blue-800',
                            'withdrawal' => 'bg-red-100 text-red-800', 
                            'transfer_out' => 'bg-yellow-100 text-yellow-800',
                            'transfer_in' => 'bg-green-100 text-green-800'
                        ];
                        $typeColor = $typeColors[$record->type] ?? 'bg-gray-100 text-gray-800';
                        $typeLabel = \App\Enums\WalletTransactionType::from($record->type)->label();
                    @endphp
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $typeColor }}">
                        {{ $typeLabel }}
                    </span>
                </dd>
            </div>
            
            <div>
                <dt class="text-sm font-medium text-gray-500">Trạng thái</dt>
                <dd class="mt-1">
                    @php
                        $statusColors = [
                            'pending' => 'bg-yellow-100 text-yellow-800',
                            'processing' => 'bg-blue-100 text-blue-800',
                            'completed' => 'bg-green-100 text-green-800',
                            'failed' => 'bg-red-100 text-red-800'
                        ];
                        $statusColor = $statusColors[$record->status] ?? 'bg-gray-100 text-gray-800';
                        $statusLabel = \App\Enums\WalletTransactionStatus::from($record->status)->label();
                    @endphp
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $statusColor }}">
                        {{ $statusLabel }}
                    </span>
                </dd>
            </div>
            
            <div>
                <dt class="text-sm font-medium text-gray-500">Số tiền</dt>
                <dd class="mt-1 text-sm text-gray-900 font-semibold">{{ number_format($record->amount, 0, ',', '.') }}₫</dd>
            </div>
            
            <div>
                <dt class="text-sm font-medium text-gray-500">Phí</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ number_format($record->fee, 0, ',', '.') }}₫</dd>
            </div>
            
            <div>
                <dt class="text-sm font-medium text-gray-500">Số tiền thực nhận</dt>
                <dd class="mt-1 text-sm text-gray-900 font-semibold">{{ number_format($record->net_amount, 0, ',', '.') }}₫</dd>
            </div>
            
            @if($record->payment_method)
            <div>
                <dt class="text-sm font-medium text-gray-500">Phương thức thanh toán</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ \App\Enums\PaymentMethod::from($record->payment_method)->label() }}</dd>
            </div>
            @endif
        </div>
        
        @if($record->description)
        <div class="mt-4">
            <dt class="text-sm font-medium text-gray-500">Mô tả</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ $record->description }}</dd>
        </div>
        @endif
        
        @if($record->note)
        <div class="mt-4">
            <dt class="text-sm font-medium text-gray-500">Ghi chú</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ $record->note }}</dd>
        </div>
        @endif
    </div>
    
    @if($record->payment_method === 'vnpay' && ($record->vnpay_txn_ref || $record->vnpay_response_code))
    <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Thông tin VNPay</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @if($record->vnpay_txn_ref)
            <div>
                <dt class="text-sm font-medium text-gray-500">Mã tham chiếu</dt>
                <dd class="mt-1 text-sm text-gray-900 font-mono">{{ $record->vnpay_txn_ref }}</dd>
            </div>
            @endif
            
            @if($record->vnpay_transaction_no)
            <div>
                <dt class="text-sm font-medium text-gray-500">Số giao dịch VNPay</dt>
                <dd class="mt-1 text-sm text-gray-900 font-mono">{{ $record->vnpay_transaction_no }}</dd>
            </div>
            @endif
            
            @if($record->vnpay_bank_code)
            <div>
                <dt class="text-sm font-medium text-gray-500">Mã ngân hàng</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ $record->vnpay_bank_code }}</dd>
            </div>
            @endif
            
            @if($record->vnpay_response_code)
            <div>
                <dt class="text-sm font-medium text-gray-500">Mã phản hồi</dt>
                <dd class="mt-1">
                    @php
                        $responseColor = $record->vnpay_response_code === '00' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
                    @endphp
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $responseColor }}">
                        {{ $record->vnpay_response_code }}
                    </span>
                </dd>
            </div>
            @endif
        </div>
    </div>
    @endif
    
    @if($record->type === 'withdrawal' && $record->withdrawal_info)
    <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Thông tin rút tiền</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @if(isset($record->withdrawal_info['bank_name']))
            <div>
                <dt class="text-sm font-medium text-gray-500">Tên ngân hàng</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ $record->withdrawal_info['bank_name'] }}</dd>
            </div>
            @endif
            
            @if(isset($record->withdrawal_info['account_number']))
            <div>
                <dt class="text-sm font-medium text-gray-500">Số tài khoản</dt>
                <dd class="mt-1 text-sm text-gray-900 font-mono">{{ $record->withdrawal_info['account_number'] }}</dd>
            </div>
            @endif
            
            @if(isset($record->withdrawal_info['account_holder']))
            <div>
                <dt class="text-sm font-medium text-gray-500">Chủ tài khoản</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ $record->withdrawal_info['account_holder'] }}</dd>
            </div>
            @endif
        </div>
    </div>
    @endif
    
    @if(in_array($record->type, ['transfer_in', 'transfer_out']))
    <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Thông tin chuyển khoản</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @if($record->type === 'transfer_out' && $record->recipient)
            <div>
                <dt class="text-sm font-medium text-gray-500">Người nhận</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ $record->recipient->username }}</dd>
            </div>
            @endif
            
            @if($record->type === 'transfer_in' && $record->sender)
            <div>
                <dt class="text-sm font-medium text-gray-500">Người gửi</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ $record->sender->username }}</dd>
            </div>
            @endif
        </div>
    </div>
    @endif
    
    <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Thời gian</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <dt class="text-sm font-medium text-gray-500">Thời gian tạo</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ $record->created_at?->format('d/m/Y H:i:s') }}</dd>
            </div>
            
            @if($record->processed_at)
            <div>
                <dt class="text-sm font-medium text-gray-500">Thời gian xử lý</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ $record->processed_at->format('d/m/Y H:i:s') }}</dd>
            </div>
            @endif
            
            @if($record->completed_at)
            <div>
                <dt class="text-sm font-medium text-gray-500">Thời gian hoàn thành</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ $record->completed_at->format('d/m/Y H:i:s') }}</dd>
            </div>
            @endif
            
            <div>
                <dt class="text-sm font-medium text-gray-500">Thời gian cập nhật</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ $record->updated_at?->format('d/m/Y H:i:s') }}</dd>
            </div>
        </div>
    </div>
</div>
