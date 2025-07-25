import { AlertCircle, AlertTriangle, ArrowRightLeft, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge"; 
import { Alert, AlertDescription } from "@/components/ui/alert";
import { config } from "process";

export const statusConfigTransaction = {
    // State machine class names
    'App\\States\\IntermediateTransaction\\PendingState': { 
        label: 'Chờ xác nhận', 
        color: 'orange', 
        icon: Clock,
        description: 'Giao dịch đang chờ đối tác xác nhận'
    },
    'App\\States\\IntermediateTransaction\\ConfirmedState': { 
        label: 'Đã xác nhận', 
        color: 'blue', 
        icon: CheckCircle,
        description: 'Giao dịch đã được xác nhận, đang chờ thực hiện'
    },
    'App\\States\\IntermediateTransaction\\SellerSentState': { 
        label: 'Người bán đã gửi', 
        color: 'blue', 
        icon: ArrowRightLeft,
        description: 'Người bán đã gửi hàng, chờ người mua xác nhận'
    },
    'App\\States\\IntermediateTransaction\\BuyerReceivedState': { 
        label: 'Người mua đã nhận', 
        color: 'green', 
        icon: CheckCircle,
        description: 'Người mua đã xác nhận nhận hàng'
    },
    'App\\States\\IntermediateTransaction\\CompletedState': { 
        label: 'Hoàn thành', 
        color: 'green', 
        icon: CheckCircle,
        description: 'Giao dịch đã hoàn thành thành công'
    },
    'App\\States\\IntermediateTransaction\\CancelledState': { 
        label: 'Đã hủy', 
        color: 'red', 
        icon: XCircle,
        description: 'Giao dịch đã bị hủy'
    },
    'App\\States\\IntermediateTransaction\\DisputedState': { 
        label: 'Tranh chấp', 
        color: 'yellow', 
        icon: AlertTriangle,
        description: 'Giao dịch đang trong quá trình giải quyết tranh chấp'
    },
    'App\\States\\IntermediateTransaction\\ExpiredState': { 
        label: 'Đã hết hạn', 
        color: 'gray', 
        icon: XCircle,
        description: 'Giao dịch đã hết hạn và được hoàn tiền (trừ phí)'
    },
    // Support for simple status names
    'expired': { 
        label: 'Đã hết hạn', 
        color: 'gray', 
        icon: XCircle,
        description: 'Giao dịch đã hết hạn và được hoàn tiền (trừ phí)'
    },
    'App\\States\\StoreTransaction\\PendingState': { 
        label: 'Chờ xác nhận', 
        color: 'orange', 
        icon: Clock,
        description: 'Giao dịch đang chờ đối tác xác nhận'
    },
    'App\\States\\StoreTransaction\\CompletedState': { 
        label: 'Hoàn thành', 
        color: 'green', 
        icon: CheckCircle,
        description: 'Giao dịch đã hoàn thành thành công'
    },
    'App\\States\\StoreTransaction\\CancelledState': { 
        label: 'Đã hủy', 
        color: 'red', 
        icon: XCircle,
        description: 'Giao dịch đã bị hủy'
    },
    'App\\States\\StoreTransaction\\DisputedState': { 
        label: 'Tranh chấp', 
        color: 'yellow', 
        icon: AlertTriangle,
        description: 'Giao dịch đang trong quá trình giải quyết tranh chấp'
    },
    'App\\States\\StoreTransaction\\ProcessingState': {
        label: 'Đang xử lý',
        color: 'blue',
        icon: ArrowRightLeft,
        description: 'Giao dịch đang được xử lý'
    },
    
};


export const getStatusBadge = (status: string) => {
    const config = statusConfigTransaction[status as keyof typeof statusConfigTransaction];
    if (!config) return null;
    
    const Icon = config.icon;
    return (
        <Badge variant="outline" className={`border-${config.color}-200 text-${config.color}-700 bg-${config.color}-50`}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
        </Badge>
    );
};


export const getStatusAlert = (status: string) => {
    const config = statusConfigTransaction[status as keyof typeof statusConfigTransaction];
    if(!config) return null;

    const Icon = config.icon
    return (
        <Alert>
            <Icon className="h-4 w-4" />
            <AlertDescription>
                {config.description}
            </AlertDescription>
        </Alert>
    )
}

