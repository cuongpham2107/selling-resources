/**
 * Format VND currency
 */
export function formatVND(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format points
 */
export function formatPoints(points: number): string {
    return `${points.toLocaleString('vi-VN')} C`;
}

/**
 * Calculate transaction fee based on amount
 */
export function calculateTransactionFee(amount: number, durationDays: number = 0): number {
    let baseFee = 0;
    
    if (amount < 100000) baseFee = 4000;
    else if (amount <= 200000) baseFee = 6000;
    else if (amount <= 1000000) baseFee = 10000;
    else if (amount <= 2000000) baseFee = 16000;
    else if (amount <= 5000000) baseFee = 36000;
    else if (amount <= 10000000) baseFee = 66000;
    else if (amount <= 30000000) baseFee = 150000;
    else baseFee = 300000;
    
    // Add 20% per day for transactions >= 1 day
    if (durationDays >= 1) {
        baseFee += baseFee * 0.2 * durationDays;
    }
    
    return baseFee;
}

/**
 * Calculate points reward based on transaction amount
 */
export function calculatePointsReward(amount: number): number {
    if (amount < 100000) return 2;
    else if (amount <= 200000) return 3;
    else if (amount <= 1000000) return 5;
    else if (amount <= 2000000) return 8;
    else if (amount <= 5000000) return 16;
    else if (amount <= 10000000) return 32;
    else if (amount <= 30000000) return 75;
    else return 150;
}

/**
 * Convert points to VND (500 VND per point)
 */
export function pointsToVND(points: number): number {
    return points * 500;
}

/**
 * Convert VND to points (500 VND per point)
 */
export function vndToPoints(amount: number): number {
    return Math.floor(amount / 500);
}
