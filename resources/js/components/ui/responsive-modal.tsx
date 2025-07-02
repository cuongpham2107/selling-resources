import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { X } from 'lucide-react';

interface ResponsiveModalProps {
    children: React.ReactNode;
    trigger?: React.ReactNode;
    title?: string;
    description?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    className?: string;
    showCloseButton?: boolean;
}

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-2 sm:mx-4',
};

export function ResponsiveModal({
    children,
    trigger,
    title,
    description,
    open,
    onOpenChange,
    size = 'md',
    className,
    showCloseButton = true,
}: ResponsiveModalProps) {
    const isMobile = useIsMobile();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent
                className={cn(
                    'w-full',
                    isMobile ? 'h-full max-h-screen rounded-none border-0 p-0' : sizeClasses[size],
                    className
                )}
            >
                {isMobile ? (
                    // Mobile full-screen layout
                    <div className="flex flex-col h-full">
                        {/* Mobile header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex-1 min-w-0">
                                {title && (
                                    <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                        {title}
                                    </DialogTitle>
                                )}
                                {description && (
                                    <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {description}
                                    </DialogDescription>
                                )}
                            </div>
                            {showCloseButton && onOpenChange && (
                                <button
                                    onClick={() => onOpenChange(false)}
                                    className="ml-4 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                        
                        {/* Mobile content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {children}
                        </div>
                    </div>
                ) : (
                    // Desktop modal layout
                    <>
                        {(title || description) && (
                            <DialogHeader>
                                {title && <DialogTitle>{title}</DialogTitle>}
                                {description && <DialogDescription>{description}</DialogDescription>}
                            </DialogHeader>
                        )}
                        <div className="mt-4">
                            {children}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

interface ResponsiveDrawerProps {
    children: React.ReactNode;
    trigger?: React.ReactNode;
    title?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    side?: 'left' | 'right';
    className?: string;
}

export function ResponsiveDrawer({
    children,
    trigger,
    title,
    open,
    onOpenChange,
    side = 'right',
    className,
}: ResponsiveDrawerProps) {
    const isMobile = useIsMobile();

    if (isMobile) {
        // On mobile, use full-screen modal
        return (
            <ResponsiveModal
                trigger={trigger}
                title={title}
                open={open}
                onOpenChange={onOpenChange}
                size="full"
                className={className}
            >
                {children}
            </ResponsiveModal>
        );
    }

    // Desktop drawer (using Dialog as base)
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent
                className={cn(
                    'fixed top-0 h-full max-w-sm p-0 m-0 rounded-none border-l border-gray-200 dark:border-gray-700',
                    side === 'left' ? 'left-0' : 'right-0',
                    className
                )}
            >
                <div className="flex flex-col h-full">
                    {title && (
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                                {title}
                            </DialogTitle>
                            {onOpenChange && (
                                <button
                                    onClick={() => onOpenChange(false)}
                                    className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    )}
                    <div className="flex-1 overflow-y-auto p-4">
                        {children}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

interface ResponsiveBottomSheetProps {
    children: React.ReactNode;
    trigger?: React.ReactNode;
    title?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    className?: string;
}

export function ResponsiveBottomSheet({
    children,
    trigger,
    title,
    open,
    onOpenChange,
    className,
}: ResponsiveBottomSheetProps) {
    const isMobile = useIsMobile();

    if (!isMobile) {
        // On desktop/tablet, use regular modal
        return (
            <ResponsiveModal
                trigger={trigger}
                title={title}
                open={open}
                onOpenChange={onOpenChange}
                size="md"
                className={className}
            >
                {children}
            </ResponsiveModal>
        );
    }

    // Mobile bottom sheet
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent
                className={cn(
                    'fixed bottom-0 left-0 right-0 max-h-[80vh] rounded-t-xl border-t border-gray-200 dark:border-gray-700 p-0 m-0',
                    className
                )}
            >
                <div className="flex flex-col max-h-[80vh]">
                    {/* Handle bar */}
                    <div className="flex justify-center p-2">
                        <div className="w-8 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    </div>
                    
                    {title && (
                        <div className="px-4 pb-4">
                            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white text-center">
                                {title}
                            </DialogTitle>
                        </div>
                    )}
                    
                    <div className="flex-1 overflow-y-auto px-4 pb-4">
                        {children}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
