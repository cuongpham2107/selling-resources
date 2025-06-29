import TransactionForm from '@/components/Customer/Transactions/Form';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Head } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

interface CreateTransactionPageProps {
    errors?: Record<string, string>;
    message?: string;
}

export default function CreateTransaction({ errors = {}, message }: CreateTransactionPageProps) {
    const [initialPartnerUsername, setInitialPartnerUsername] = useState<string>('');

    // Pre-fill partner username from URL parameters
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const withUser = urlParams.get('with_user');
        const username = urlParams.get('username');
        
        if (withUser && username) {
            setInitialPartnerUsername(username);
        }
    }, []);

    return (
        <CustomerLayout title="Tạo giao dịch trung gian">
            <Head title="Tạo giao dịch trung gian" />
            <TransactionForm
                errors={errors}
                message={message}
                initialPartnerUsername={initialPartnerUsername}
            />
        </CustomerLayout>
    );
}
