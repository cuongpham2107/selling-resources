import { AlertTriangle, ArrowRightLeft, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge"; 

export const statusConfig = {
    pending: { 
        label: 'Chờ xác nhận', 
        color: 'orange', 
        icon: Clock 
    },
    confirmed: { 
        label: 'Đang thực hiện', 
        color: 'blue', 
        icon: ArrowRightLeft 
    },
    completed: { 
        label: 'Hoàn thành', 
        color: 'green', 
        icon: CheckCircle 
    },
    cancelled: { 
        label: 'Đã hủy', 
        color: 'red', 
        icon: XCircle 
    },
    disputed: { 
        label: 'Tranh chấp', 
        color: 'yellow', 
        icon: AlertTriangle 
    },
};


export const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;
    
    const Icon = config.icon;
    return (
        <Badge variant="outline" className={`border-${config.color}-200 text-${config.color}-700 bg-${config.color}-50`}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
        </Badge>
    );
};