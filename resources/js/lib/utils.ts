import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Generate referral link
 */
export function generateReferralLink(referralCode: string): string {
    return `${window.location.origin}/?ref=${referralCode}`;
}

/**
 * Get transaction status color
 */
export function getTransactionStatusColor(status: string): string {
    const statusColors = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        PROCESSING: 'bg-blue-100 text-blue-800',
        COMPLETED: 'bg-green-100 text-green-800',
        CANCELLED: 'bg-gray-100 text-gray-800',
        DISPUTED: 'bg-red-100 text-red-800',
        PAID: 'bg-blue-100 text-blue-800',
        DELIVERED: 'bg-purple-100 text-purple-800',
        REFUNDED: 'bg-orange-100 text-orange-800',
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
}



/**
 * Get dispute status color
 */
export function getDisputeStatusColor(status: string): string {
    const statusColors = {
        OPEN: 'bg-red-100 text-red-800',
        UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
        RESOLVED: 'bg-green-100 text-green-800',
        ESCALATED: 'bg-purple-100 text-purple-800',
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
}

/**
 * Get dispute status text in Vietnamese
 */
export function getDisputeStatusText(status: string): string {
    const statusTexts = {
        OPEN: 'Mở',
        UNDER_REVIEW: 'Đang xem xét',
        RESOLVED: 'Đã giải quyết',
        ESCALATED: 'Đã chuyển cấp cao',
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

/**
 * Validate file size and type for uploads
 */
export function validateFile(file: File, maxSizeMB: number = 1, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif']): { valid: boolean; error?: string } {
    if (file.size > maxSizeMB * 1024 * 1024) {
        return { valid: false, error: `File quá lớn. Kích thước tối đa: ${maxSizeMB}MB` };
    }
    
    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Định dạng file không được hỗ trợ' };
    }
    
    return { valid: true };
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}


export const getStatusLabel = (status: string) => {
    const statusLabels = {
        pending: 'Đang chờ',
        confirmed: 'Đã xác nhận',
        seller_sent: 'Người bán đã gửi',
        buyer_received: 'Người mua đã nhận',
        completed: 'Hoàn thành',
        disputed: 'Tranh chấp',
        cancelled: 'Đã hủy',
        expired: 'Hết hạn',
    };
    return statusLabels[status as keyof typeof statusLabels] || status;
};
