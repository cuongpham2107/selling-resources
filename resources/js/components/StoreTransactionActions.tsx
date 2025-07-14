import React from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    CheckCircle,
    Shield,
    AlertTriangle,
    MessageSquare,
    DollarSign
} from 'lucide-react';
import { formatVND } from '@/lib/currency';
import type { StoreTransaction } from '@/types';

interface StoreTransactionActionsProps {
    transaction: StoreTransaction;
    isBuyer: boolean;
    size?: 'sm' | 'default' | 'lg';
    variant?: 'full' | 'compact';
}

export default function StoreTransactionActions({ 
    transaction, 
    isBuyer, 
    size = 'default',
    variant = 'full' 
}: StoreTransactionActionsProps) {
    const [isConfirming, setIsConfirming] = React.useState(false);
    const [isCompleting, setIsCompleting] = React.useState(false);
    const [isCancelling, setIsCancelling] = React.useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
    const [completeDialogOpen, setCompleteDialogOpen] = React.useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
    const [disputeDialogOpen, setDisputeDialogOpen] = React.useState(false);

    const handleConfirmTransaction = async () => {
        if (!transaction.permissions?.can_confirm) return;

        setIsConfirming(true);
        setConfirmDialogOpen(false);
        try {
            await router.post(`/customer/store/transactions/${transaction.id}/confirm`);
        } catch (error) {
            console.error('Confirm transaction failed:', error);
        } finally {
            setIsConfirming(false);
        }
    };

    const handleCompleteTransaction = async () => {
        if (!transaction.permissions?.can_complete) return;

        setIsCompleting(true);
        setCompleteDialogOpen(false);
        try {
            await router.post(`/customer/store/transactions/${transaction.id}/complete`);
        } catch (error) {
            console.error('Complete transaction failed:', error);
        } finally {
            setIsCompleting(false);
        }
    };

    const handleCancelTransaction = async () => {
        if (!transaction.permissions?.can_cancel) return;

        setIsCancelling(true);
        setCancelDialogOpen(false);
        try {
            await router.post(`/customer/store/transactions/${transaction.id}/cancel`);
        } catch (error) {
            console.error('Cancel transaction failed:', error);
        } finally {
            setIsCancelling(false);
        }
    };

    const handleCreateDispute = () => {
        setDisputeDialogOpen(false);
        router.get(`/customer/disputes/create?transaction_id=${transaction.id}&type=store`);
    };

    const handleOpenChat = () => {
        router.get(`/customer/chat/transaction/store/${transaction.id}`);
    };

    const buttonClass = variant === 'compact' ? 'w-auto' : 'w-full';

    return (
        <div className={`space-y-2 ${variant === 'compact' ? 'flex gap-2' : ''}`}>
            {/* Confirm transaction (seller only, pending status) */}
            {transaction.permissions?.can_confirm && (
                <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                    <DialogTrigger asChild>
                        <Button 
                            size={size}
                            className={buttonClass}
                            disabled={isConfirming}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {isConfirming ? 'Đang xử lý...' : 'Xác nhận đơn hàng'}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Xác nhận đơn hàng</DialogTitle>
                            <DialogDescription>
                                Bạn có chắc chắn muốn xác nhận đơn hàng này? Sau khi xác nhận, giao dịch sẽ chuyển sang trạng thái đang xử lý.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium text-blue-900">Chi tiết thanh toán</span>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Giá sản phẩm:</span>
                                        <span className="font-medium">{formatVND(transaction.amount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phí giao dịch (1%):</span>
                                        <span className="text-red-600">-{formatVND(transaction.amount * 0.01)}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold text-green-600 pt-1 border-t">
                                        <span>Bạn sẽ nhận được:</span>
                                        <span>{formatVND(transaction.amount * 0.99)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                                Hủy
                            </Button>
                            <Button onClick={handleConfirmTransaction} disabled={isConfirming}>
                                {isConfirming ? 'Đang xử lý...' : 'Xác nhận đơn hàng'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Complete transaction (buyer only, processing status) */}
            {transaction.permissions?.can_complete && (
                <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
                    <DialogTrigger asChild>
                        <Button 
                            size={size}
                            className={buttonClass}
                            disabled={isCompleting}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {isCompleting ? 'Đang xử lý...' : 'Xác nhận đã nhận hàng'}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Xác nhận đã nhận hàng</DialogTitle>
                            <DialogDescription>
                                Bạn có chắc chắn đã nhận được sản phẩm và hài lòng với chất lượng? Sau khi xác nhận, tiền sẽ được chuyển cho người bán và giao dịch s�� hoàn thành.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="font-medium text-green-900">Thông tin giao dịch</span>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Sản phẩm:</span>
                                        <span className="font-medium">{transaction.product?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Số tiền:</span>
                                        <span className="font-medium">{formatVND(transaction.amount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Người bán:</span>
                                        <span className="font-medium">{transaction.seller?.username}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCompleteDialogOpen(false)}>
                                Chưa nhận được hàng
                            </Button>
                            <Button onClick={handleCompleteTransaction} disabled={isCompleting}>
                                {isCompleting ? 'Đang xử lý...' : 'Đã nhận hàng, hoàn thành'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Create dispute */}
            {transaction.permissions?.can_dispute && variant === 'full' && (
                <Dialog open={disputeDialogOpen} onOpenChange={setDisputeDialogOpen}>
                    <DialogTrigger asChild>
                        <Button 
                            size={size}
                            variant="destructive" 
                            className={buttonClass}
                        >
                            <Shield className="h-4 w-4 mr-2" />
                            Tạo tranh chấp
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tạo tranh chấp</DialogTitle>
                            <DialogDescription>
                                Bạn có vấn đề với giao dịch này? Hệ thống sẽ tạm dừng giao dịch và chuyển cho bộ phận hỗ trợ xử lý.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                    <span className="font-medium text-yellow-900">Lưu ý quan trọng</span>
                                </div>
                                <ul className="text-sm text-yellow-800 space-y-1">
                                    <li>• Giao dịch sẽ bị tạm dừng cho đến khi giải quyết xong</li>
                                    <li>• Bạn cần cung cấp bằng chứng và mô tả chi tiết vấn đề</li>
                                    <li>• Thời gian xử lý tranh chấp từ 1-3 ngày làm việc</li>
                                    <li>• Chỉ tạo tranh chấp khi thực sự cần thiết</li>
                                </ul>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDisputeDialogOpen(false)}>
                                Hủy
                            </Button>
                            <Button variant="destructive" onClick={handleCreateDispute}>
                                Tiếp tục tạo tranh chấp
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Cancel transaction */}
            {transaction.permissions?.can_cancel && variant === 'full' && (
                <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                    <DialogTrigger asChild>
                        <Button 
                            size={size}
                            variant="outline" 
                            className={`${buttonClass} border-red-300 text-red-700 hover:bg-red-50`}
                            disabled={isCancelling}
                        >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            {isCancelling ? 'Đang hủy...' : 'Hủy giao dịch'}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hủy giao dịch</DialogTitle>
                            <DialogDescription>
                                Bạn có chắc chắn muốn hủy giao dịch này? Hành động này không thể hoàn tác.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <div className="bg-red-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                    <span className="font-medium text-red-900">Hậu quả khi hủy giao dịch</span>
                                </div>
                                <ul className="text-sm text-red-800 space-y-1">
                                    {isBuyer ? (
                                        <>
                                            <li>• Tiền sẽ được hoàn lại vào ví của bạn</li>
                                            <li>• Giao dịch sẽ bị đánh dấu là đã hủy</li>
                                            <li>• Không thể khôi phục giao dịch sau khi hủy</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>• Đơn hàng sẽ bị hủy và tiền hoàn lại cho người mua</li>
                                            <li>• Sản phẩm sẽ trở lại trạng thái có sẵn</li>
                                            <li>• Điều này có thể ảnh hưởng đến uy tín của bạn</li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                                Giữ lại giao dịch
                            </Button>
                            <Button variant="destructive" onClick={handleCancelTransaction} disabled={isCancelling}>
                                {isCancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Chat button */}
            {transaction.permissions?.can_chat && (
                <Button 
                    size={size}
                    variant="outline" 
                    className={buttonClass}
                    onClick={handleOpenChat}
                >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat với {isBuyer ? 'người bán' : 'người mua'}
                </Button>
            )}
        </div>
    );
}
