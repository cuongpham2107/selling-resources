import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Customer } from '@/types';

interface PageProps extends Record<string, unknown> {
    auth: {
        customer?: Customer;
        user?: unknown;
    };
}

export function useCustomerAuth() {
    const { props } = usePage<PageProps>();
    const customer = props.auth?.customer || null;
    const isAuthenticated = !!customer;
    const [loading] = useState(false);

    const login = () => {
        // For login, redirect to refresh the page with new auth data
        window.location.href = '/customer/dashboard';
    };

    const logout = () => {
        // Use Inertia router to make a POST request to logout
        router.post('/customer/logout');
    };

    const updateCustomer = (updatedData: Partial<Customer>) => {
        // For updates, you might want to make an API call and then refresh
        // This depends on your backend implementation
        console.log('Customer update:', updatedData);
    };

    return {
        customer,
        loading,
        isAuthenticated,
        login,
        logout,
        updateCustomer,
    };
}
