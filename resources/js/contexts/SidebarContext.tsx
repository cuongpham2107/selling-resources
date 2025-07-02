import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

interface SidebarContextType {
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
    toggleMobileMenu: () => void;
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
    toggleSidebarCollapsed: () => void;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProviderProps {
    children: ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { isMobile, isTablet, isDesktop } = useBreakpoint();

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const toggleSidebarCollapsed = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    // Auto-close mobile menu when switching to desktop
    useEffect(() => {
        if (isDesktop && mobileMenuOpen) {
            setMobileMenuOpen(false);
        }
    }, [isDesktop, mobileMenuOpen]);

    // Auto-collapse sidebar on tablet
    useEffect(() => {
        if (isTablet) {
            setSidebarCollapsed(true);
        } else if (isDesktop) {
            setSidebarCollapsed(false);
        }
    }, [isTablet, isDesktop]);

    return (
        <SidebarContext.Provider 
            value={{ 
                mobileMenuOpen, 
                setMobileMenuOpen, 
                toggleMobileMenu,
                sidebarCollapsed,
                setSidebarCollapsed,
                toggleSidebarCollapsed,
                isMobile,
                isTablet,
                isDesktop
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
}
