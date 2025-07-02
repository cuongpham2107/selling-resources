import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useBreakpoint';

interface Column {
    key: string;
    title: string;
    render?: (value: unknown, record: Record<string, unknown>) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
    mobileHide?: boolean; // Hide on mobile
    tabletHide?: boolean; // Hide on tablet
}

interface ResponsiveTableProps {
    data: Record<string, unknown>[];
    columns: Column[];
    className?: string;
    loading?: boolean;
    emptyText?: string;
    pagination?: {
        current: number;
        pageSize: number;
        total: number;
        onChange: (page: number) => void;
    };
    mobileCardMode?: boolean; // Show as cards on mobile
}

export function ResponsiveTable({
    data,
    columns,
    className,
    loading = false,
    emptyText = 'Không có dữ liệu',
    pagination,
    mobileCardMode = true
}: ResponsiveTableProps) {
    const isMobile = useIsMobile();

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {emptyText}
            </div>
        );
    }

    // Mobile card view
    if (isMobile && mobileCardMode) {
        return (
            <div className="space-y-4">
                {data.map((record, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                        {columns.filter(col => !col.mobileHide).map((column) => (
                            <div key={column.key} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {column.title}:
                                </span>
                                <span className="text-sm text-gray-900 dark:text-white">
                                    {column.render 
                                        ? column.render(record[column.key], record) 
                                        : String(record[column.key] || '')
                                    }
                                </span>
                            </div>
                        ))}
                    </div>
                ))}
                {pagination && (
                    <div className="flex justify-center mt-6">
                        <Pagination {...pagination} />
                    </div>
                )}
            </div>
        );
    }

    // Desktop table view
    return (
        <div className={cn('overflow-x-auto', className)}>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        {columns.filter(col => {
                            if (col.mobileHide && isMobile) return false;
                            if (col.tabletHide && window.innerWidth < 1024) return false;
                            return true;
                        }).map((column) => (
                            <th
                                key={column.key}
                                className={cn(
                                    'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
                                    column.align === 'center' && 'text-center',
                                    column.align === 'right' && 'text-right',
                                    column.width && `w-${column.width}`
                                )}
                            >
                                {column.title}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {data.map((record, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            {columns.filter(col => {
                                if (col.mobileHide && isMobile) return false;
                                if (col.tabletHide && window.innerWidth < 1024) return false;
                                return true;
                            }).map((column) => (
                                <td
                                    key={column.key}
                                    className={cn(
                                        'px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white',
                                        column.align === 'center' && 'text-center',
                                        column.align === 'right' && 'text-right'
                                    )}
                                >
                                    {column.render 
                                        ? column.render(record[column.key], record) 
                                        : String(record[column.key] || '')
                                    }
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {pagination && (
                <div className="flex justify-center mt-6">
                    <Pagination {...pagination} />
                </div>
            )}
        </div>
    );
}

// Simple pagination component
interface PaginationProps {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number) => void;
}

function Pagination({ current, pageSize, total, onChange }: PaginationProps) {
    const totalPages = Math.ceil(total / pageSize);
    const isMobile = useIsMobile();

    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
        const maxVisible = isMobile ? 5 : 7;
        const half = Math.floor(maxVisible / 2);
        let start = Math.max(1, current - half);
        const end = Math.min(totalPages, start + maxVisible - 1);
        
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }
        
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const visiblePages = getVisiblePages();

    return (
        <div className="flex items-center justify-center space-x-1 sm:space-x-2">
            <button
                onClick={() => onChange(current - 1)}
                disabled={current === 1}
                className="px-2 sm:px-3 py-1 sm:py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
                ‹
            </button>
            
            {visiblePages[0] > 1 && (
                <>
                    <button
                        onClick={() => onChange(1)}
                        className="px-2 sm:px-3 py-1 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        1
                    </button>
                    {visiblePages[0] > 2 && <span className="text-gray-500">...</span>}
                </>
            )}
            
            {visiblePages.map((page) => (
                <button
                    key={page}
                    onClick={() => onChange(page)}
                    className={cn(
                        'px-2 sm:px-3 py-1 sm:py-2 text-sm font-medium rounded-md',
                        current === page
                            ? 'text-white bg-blue-600 border border-blue-600'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                    )}
                >
                    {page}
                </button>
            ))}
            
            {visiblePages[visiblePages.length - 1] < totalPages && (
                <>
                    {visiblePages[visiblePages.length - 1] < totalPages - 1 && <span className="text-gray-500">...</span>}
                    <button
                        onClick={() => onChange(totalPages)}
                        className="px-2 sm:px-3 py-1 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        {totalPages}
                    </button>
                </>
            )}
            
            <button
                onClick={() => onChange(current + 1)}
                disabled={current === totalPages}
                className="px-2 sm:px-3 py-1 sm:py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
                ›
            </button>
        </div>
    );
}
