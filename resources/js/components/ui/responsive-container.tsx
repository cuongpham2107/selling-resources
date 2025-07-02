import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
}

const paddingClasses = {
    none: '',
    sm: 'px-3 sm:px-4 py-3 sm:py-4',
    md: 'px-3 sm:px-4 lg:px-6 py-4 sm:py-6',
    lg: 'px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8',
    xl: 'px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 lg:py-12',
};

const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
};

export function ResponsiveContainer({ 
    children, 
    className, 
    padding = 'md',
    maxWidth = 'full'
}: ResponsiveContainerProps) {
    return (
        <div className={cn(
            'mx-auto w-full',
            maxWidthClasses[maxWidth],
            paddingClasses[padding],
            className
        )}>
            {children}
        </div>
    );
}

interface ResponsiveGridProps {
    children: React.ReactNode;
    className?: string;
    cols?: {
        default?: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
        '2xl'?: number;
    };
    gap?: 'sm' | 'md' | 'lg' | 'xl';
}

const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4 lg:gap-6',
    lg: 'gap-4 sm:gap-6 lg:gap-8',
    xl: 'gap-6 sm:gap-8 lg:gap-10',
};

export function ResponsiveGrid({ 
    children, 
    className, 
    cols = { default: 1, sm: 2, lg: 3, xl: 4 },
    gap = 'md'
}: ResponsiveGridProps) {
    const gridClasses = [
        cols.default && `grid-cols-${cols.default}`,
        cols.sm && `sm:grid-cols-${cols.sm}`,
        cols.md && `md:grid-cols-${cols.md}`,
        cols.lg && `lg:grid-cols-${cols.lg}`,
        cols.xl && `xl:grid-cols-${cols.xl}`,
        cols['2xl'] && `2xl:grid-cols-${cols['2xl']}`,
    ].filter(Boolean).join(' ');

    return (
        <div className={cn(
            'grid',
            gridClasses,
            gapClasses[gap],
            className
        )}>
            {children}
        </div>
    );
}

interface ResponsiveStackProps {
    children: React.ReactNode;
    className?: string;
    direction?: 'vertical' | 'horizontal-mobile' | 'horizontal-tablet' | 'horizontal-desktop';
    gap?: 'sm' | 'md' | 'lg' | 'xl';
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

export function ResponsiveStack({ 
    children, 
    className,
    direction = 'vertical',
    gap = 'md',
    align = 'stretch',
    justify = 'start'
}: ResponsiveStackProps) {
    const directionClasses = {
        'vertical': 'flex flex-col',
        'horizontal-mobile': 'flex flex-row',
        'horizontal-tablet': 'flex flex-col sm:flex-row',
        'horizontal-desktop': 'flex flex-col lg:flex-row',
    };

    const gapClasses = {
        sm: 'gap-2 sm:gap-3',
        md: 'gap-3 sm:gap-4 lg:gap-6',
        lg: 'gap-4 sm:gap-6 lg:gap-8',
        xl: 'gap-6 sm:gap-8 lg:gap-10',
    };

    const alignClasses = {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch',
    };

    const justifyClasses = {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly',
    };

    return (
        <div className={cn(
            directionClasses[direction],
            gapClasses[gap],
            alignClasses[align],
            justifyClasses[justify],
            className
        )}>
            {children}
        </div>
    );
}

interface ResponsiveTextProps {
    children: React.ReactNode;
    className?: string;
    size?: {
        default?: string;
        sm?: string;
        md?: string;
        lg?: string;
        xl?: string;
    };
    weight?: 'normal' | 'medium' | 'semibold' | 'bold';
    color?: string;
}

export function ResponsiveText({ 
    children, 
    className,
    size = { default: 'text-base' },
    weight = 'normal',
    color = 'text-gray-900 dark:text-white'
}: ResponsiveTextProps) {
    const weightClasses = {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
    };

    const sizeClasses = [
        size.default,
        size.sm && `sm:${size.sm}`,
        size.md && `md:${size.md}`,
        size.lg && `lg:${size.lg}`,
        size.xl && `xl:${size.xl}`,
    ].filter(Boolean).join(' ');

    return (
        <span className={cn(
            sizeClasses,
            weightClasses[weight],
            color,
            className
        )}>
            {children}
        </span>
    );
}
