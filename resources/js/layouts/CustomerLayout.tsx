import React, { ReactNode } from 'react';
import { Head } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { CustomerNavbar } from '@/components/Customer/CustomerNavbar';
import { CustomerSidebar } from '@/components/Customer/CustomerSidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';

interface CustomerLayoutProps {
    children: ReactNode;
    title?: string;
    showSidebar?: boolean;
}

export default function CustomerLayout({ 
    children, 
    title = 'Giao Dịch MMO',
    showSidebar = true
}: CustomerLayoutProps) {
    const { customer } = useCustomerAuth();
    
    
    return (
        <SidebarProvider>
            <Head title={title} />
            
            <div className="min-h-screen bg-gray-50">
                <CustomerNavbar />
                
                <div className="flex">
                    {/* Sidebar with responsive behavior */}
                    {showSidebar && (
                        <CustomerSidebar customer={customer} />
                    )}
                    
                    <main className={`flex-1 ${showSidebar ? 'lg:ml-64' : ''} pt-16`}>
                        <div className="container mx-auto px-4 py-6">
                            {children}
                        </div>
                    </main>
                </div>
                <Toaster />
            </div>
        </SidebarProvider>
    );
}
