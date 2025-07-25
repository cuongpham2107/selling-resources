import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AutoCompleteCountdownProps {
    autoCompleteAt: string;
    className?: string;
    showIcon?: boolean;
}

export const AutoCompleteCountdown: React.FC<AutoCompleteCountdownProps> = ({ 
    autoCompleteAt, 
    className = '',
    showIcon = true 
}) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const target = new Date(autoCompleteAt).getTime();
            const difference = target - now;
            
            if (difference <= 0) {
                setTimeLeft(0);
                setIsExpired(true);
                return;
            }
            
            setTimeLeft(difference);
            setIsExpired(false);
        };

        // Calculate immediately
        calculateTimeLeft();

        // Update every second
        const interval = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [autoCompleteAt]);

    const formatTimeLeft = (milliseconds: number): string => {
        if (milliseconds <= 0) return '00:00:00';

        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    };

    const getVariant = () => {
        if (isExpired) return 'destructive';
        if (timeLeft < 3600000) return 'secondary'; // Less than 1 hour
        return 'outline';
    };

    const getIcon = () => {
        if (isExpired) return <AlertTriangle className="w-3 h-3 mr-1" />;
        return <Clock className="w-3 h-3 mr-1" />;
    };

    if (isExpired) {
        return (
            <Badge variant="destructive" className={className}>
                {showIcon && getIcon()}
                Đã hết hạn
            </Badge>
        );
    }

    return (
        <Badge variant={getVariant()} className={className}>
            {showIcon && getIcon()}
            Tự động hoàn thành sau: {formatTimeLeft(timeLeft)} (nếu không có tranh chấp)
        </Badge>
    );
};

export default AutoCompleteCountdown;