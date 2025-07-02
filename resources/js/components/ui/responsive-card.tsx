import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ResponsiveCardProps {
    children?: React.ReactNode;
    title?: string;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
    border?: boolean;
    shadow?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
};

const shadowClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
};

export function ResponsiveCard({ 
    children, 
    title, 
    className,
    padding = 'md',
    hover = true,
    border = true,
    shadow = 'sm'
}: ResponsiveCardProps) {
    return (
        <Card className={cn(
            'transition-all duration-200',
            hover && 'hover:shadow-md hover:scale-[1.01]',
            !border && 'border-0',
            shadowClasses[shadow],
            className
        )}>
            {title && (
                <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                        {title}
                    </CardTitle>
                </CardHeader>
            )}
            <CardContent className={cn(paddingClasses[padding], title && 'pt-0')}>
                {children}
            </CardContent>
        </Card>
    );
}

interface StatsCardProps {
    title: string;
    value: string | number;
    icon?: React.ComponentType<{ className?: string }>;
    iconColor?: string;
    valueColor?: string;
    subtitle?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

export function StatsCard({ 
    title, 
    value, 
    icon: Icon,
    iconColor = 'text-blue-600 dark:text-blue-400',
    valueColor = 'text-gray-900 dark:text-white',
    subtitle,
    trend,
    className
}: StatsCardProps) {
    return (
        <ResponsiveCard 
            className={className}
            padding="md"
            hover
        >
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                        {title}
                    </p>
                    <div className="mt-1 sm:mt-2">
                        <p className={cn(
                            'text-xl sm:text-2xl font-bold truncate',
                            valueColor
                        )}>
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </p>
                        {subtitle && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {subtitle}
                            </p>
                        )}
                        {trend && (
                            <div className={cn(
                                'flex items-center mt-2 text-xs font-medium',
                                trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            )}>
                                <span className="mr-1">
                                    {trend.isPositive ? '↗' : '↘'}
                                </span>
                                {Math.abs(trend.value)}%
                            </div>
                        )}
                    </div>
                </div>
                {Icon && (
                    <div className="ml-4 flex-shrink-0">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <Icon className={cn('h-5 w-5 sm:h-6 sm:w-6', iconColor)} />
                        </div>
                    </div>
                )}
            </div>
        </ResponsiveCard>
    );
}

interface ActionCardProps {
    title: string;
    description?: string;
    icon?: React.ComponentType<{ className?: string }>;
    action: () => void;
    actionLabel: string;
    variant?: 'primary' | 'secondary' | 'outline';
    disabled?: boolean;
    className?: string;
}

export function ActionCard({ 
    title, 
    description, 
    icon: Icon,
    action,
    actionLabel,
    variant = 'primary',
    disabled = false,
    className
}: ActionCardProps) {
    const variantClasses = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
        outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    };

    return (
        <ResponsiveCard 
            className={className}
            padding="md"
            hover
        >
            <div className="text-center sm:text-left">
                {Icon && (
                    <div className="mx-auto sm:mx-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {title}
                </h3>
                {description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {description}
                    </p>
                )}
                <button
                    onClick={action}
                    disabled={disabled}
                    className={cn(
                        'w-full sm:w-auto px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        variantClasses[variant]
                    )}
                >
                    {actionLabel}
                </button>
            </div>
        </ResponsiveCard>
    );
}
