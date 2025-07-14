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
    DollarSign,
    Truck,
    Package
} from 'lucide-react';
import { formatVND } from '@/lib/currency';
import type { IntermediateTransaction } from '@/types';

interface IntermediateTransactionActionsProps {
    transaction: IntermediateTransaction;
    isBuyer: boolean;
    size?: 'sm' | 'default' | 'lg';
    variant?: 'full' | 'compact';
}

export default function IntermediateTransactionActions({ 
    transaction, 
    isBuyer, 
    size = 'default',
    variant = 'full' 
}: IntermediateTransactionActionsProps) {
    const [isConfirming, setIsConfirming] = React.useState(false);
    const [isShipping, setIsShipping] = React.useState(false);
    const [isCompleting, setIsCompleting] = React.useState(false);
    const [isCancelling, setIsCancelling] = React.useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
    const [shipDialogOpen, setShipDialogOpen] = React.useState(false);
    const [completeDialogOpen, setCompleteDialogOpen] = React.useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
    const [disputeDialogOpen, setDisputeDialogOpen] = React.useState(false);

    const handleConfirmTransaction = async () => {
        setIsConfirming(true);
        setConfirmDialogOpen(false);
        try {
            await router.patch(`/customer/transactions/${transaction.id}`, { action: 'confirm' });
        } catch (error) {
            console.error('Confirm transaction failed:', error);
        } finally {
            setIsConfirming(false);
        }
    };

    const handleShipTransaction = async () => {
        setIsShipping(true);
        setShipDialogOpen(false);
        try {
            await router.patch(`/customer/transactions/${transaction.id}`, { action: 'shipped' });
        } catch (error) {
            console.error('Ship transaction failed:', error);
        } finally {
            setIsShipping(false);
        }
    };

    const handleCompleteTransaction = async () => {
        setIsCompleting(true);
        setCompleteDialogOpen(false);
        try {
            await router.patch(`/customer/transactions/${transaction.id}`, { action: 'received' });
        } catch (error) {
            console.error('Complete transaction failed:', error);
        } finally {
            setIsCompleting(false);
        }
    };

    const handleCancelTransaction = async () => {
        setIsCancelling(true);
        setCancelDialogOpen(false);
        try {
            await router.patch(`/customer/transactions/${transaction.id}`, { action: 'cancel' });
        } catch (error) {
            console.error('Cancel transaction failed:', error);
        } finally {
            setIsCancelling(false);
        }
    };

    const handleCreateDispute = () => {
        setDisputeDialogOpen(false);
        router.get(`/customer/disputes/create?transaction_id=${transaction.id}&type=intermediate`);
    };

    const handleOpenChat = () => {
        router.get(`/customer/chat/transaction/intermediate/${transaction.id}`);
    };

    const buttonClass = variant === 'compact' ? 'w-auto' : 'w-full';

    // Helper to check status
    const isStatus = (statusClass: string) => {
        return transaction.status === statusClass || 
               transaction.status === `App\\States\\IntermediateTransaction\\${statusClass}`;
    };

    const canConfirm = !isBuyer && isStatus('PendingState');
    const canShip = !isBuyer && isStatus('ConfirmedState');
    const canComplete = isBuyer && isStatus('SellerSentState');
    const canCancel = isStatus('PendingState') || isStatus('ConfirmedState');
    const canDispute = isStatus('ConfirmedState') || isStatus('SellerSentState');
    const canChat = !isStatus('PendingState') && !isStatus('CompletedState') && !isStatus('CancelledState');

    return (
        <div className={`space-y-2 ${variant === 'compact' ? 'flex gap-2' : ''}`}>
            {/* Confirm transaction (seller only, pending status) */}
            {canConfirm && (
                <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                    <DialogTrigger asChild>
                        <Button 
                            size={size}
                            className={buttonClass}
                            disabled={isConfirming}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {isConfirming ? 'Đang xử lý...' : 'Xác nhận giao dịch'}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Xác nhận giao dịch trung gian</DialogTitle>
                            <DialogDescription>
                                Bạn có chắc chắn muốn xác nhận giao dịch này? Sau khi xác nhận, bạn cam kết thực hiện giao dịch theo mô tả.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium text-blue-900">Chi tiết giao dịch</span>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Mô tả:</span>
                                        <span className="font-medium">{transaction.description}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Số tiền:</span>
                                        <span className="font-medium">{formatVND(transaction.amount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phí giao dịch:</span>
                                        <span className="text-orange-600">{formatVND(transaction.fee || 0)}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold text-green-600 pt-1 border-t">
                                        <span>Bạn sẽ nhận được:</span>
                                        <span>{formatVND(transaction.amount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                                Hủy
                            </Button>
                            <Button onClick={handleConfirmTransaction} disabled={isConfirming}>
                                {isConfirming ? 'Đang xử lý...' : 'Xác nhận giao dịch'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Mark as shipped (seller only, confirmed status) */}
            {canShip && (
                <Dialog open={shipDialogOpen} onOpenChange={setShipDialogOpen}>
                    <DialogTrigger asChild>
                        <Button 
                            size={size}
                            className={buttonClass}
                            disabled={isShipping}
                        >
                            <Truck className="h-4 w-4 mr-2" />
                            {isShipping ? 'Đang xử lý...' : 'Đánh dấu đã gửi'}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Xác nhận đã gửi hàng</DialogTitle>
                            <DialogDescription>
                                Bạn có chắc chắn đã gửi hàng/thực hiện dịch vụ theo yêu cầu? Người mua sẽ được thông báo và có thể xác nhận đã nhận.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Truck className="h-4 w-4 text-green-600" />
                                    <span className="font-medium text-green-900">Lưu ý quan trọng</span>
                                </div>
                                <ul className="text-sm text-green-800 space-y-1">
                                    <li>• Chỉ đánh dấu khi đã thực sự gửi hàng/hoàn thành dịch vụ</li>
                                    <li>• Người mua sẽ có thời gian để xác nhận đã nhận</li>
                                    <li>• Nếu người mua không xác nhận, giao dịch sẽ tự động hoàn thành</li>
                                    <li>• Bạn có thể chat với người mua để cập nhật tiến độ</li>
                                </ul>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShipDialogOpen(false)}>
                                Chưa gửi
                            </Button>
                            <Button onClick={handleShipTransaction} disabled={isShipping}>
                                {isShipping ? 'Đang xử lý...' : 'Đã gửi hàng'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Complete transaction (buyer only, seller sent status) */}
            {canComplete && (
                <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
                    <DialogTrigger asChild>
                        <Button 
                            size={size}
                            className={buttonClass}
                            disabled={isCompleting}
                        >
                            <Package className="h-4 w-4 mr-2" />
                            {isCompleting ? 'Đang xử lý...' : 'Xác nhận đã nhận'}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Xác nhận đã nhận hàng/dịch vụ</DialogTitle>
                            <DialogDescription>
                                Bạn có chắc chắn đã nhận được hàng/dịch vụ và hài lòng với chất lượng? Sau khi xác nhận, tiền sẽ được chuyển cho người bán.
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
                                        <span className="text-gray-600">Mô tả:</span>
                                        <span className="font-medium">{transaction.description}</span>
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
                                Chưa nhận được
                            </Button>
                            <Button onClick={handleCompleteTransaction} disabled={isCompleting}>
                                {isCompleting ? 'Đang xử lý...' : 'Đã nhận, hoàn thành'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Create dispute */}
            {canDispute && variant === 'full' && (
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
            {canCancel && variant === 'full' && (
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
                                            <li>• Tiền sẽ được hoàn lại vào ví của bạn (trừ phí giao dịch)</li>
                                            <li>• Giao dịch sẽ bị đánh dấu là đã hủy</li>
                                            <li>• Không thể khôi phục giao dịch sau khi hủy</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>• Giao dịch sẽ bị hủy và tiền hoàn lại cho người mua</li>
                                            <li>• Điều này có thể ảnh hưởng đến uy tín của bạn</li>
                                            <li>• Hãy cân nhắc kỹ trước khi hủy</li>
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
            {canChat && (
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