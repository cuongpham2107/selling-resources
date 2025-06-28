import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

// Customer interfaces for frontend
export interface Customer {
    id: number;
    username: string;
    email: string;
    phone?: string;
    is_active: boolean;
    referral_code: string;
    referred_by?: number;
    kyc_verified_at?: string;
    kyc_data?: Record<string, unknown>;
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
    balance?: CustomerBalance;
    points?: CustomerPoint;
    personal_store?: PersonalStore;
    referrer?: Customer;
}

export interface CustomerBalance {
    id: number;
    customer_id: number;
    balance: number;
    locked_balance: number;
    available_balance?: number; // Computed field
    created_at: string;
    updated_at: string;
}

export interface CustomerPoint {
    id: number;
    customer_id: number;
    points: number;
    total_earned: number;
    total_spent: number;
    created_at: string;
    updated_at: string;
}

export interface PersonalStore {
    id: number;
    owner_id: number;
    store_name: string;
    description?: string;
    avatar?: string;
    banner?: string;
    is_verified: boolean;
    is_active: boolean;
    is_locked: boolean;
    locked_by?: number | null;
    locked_at?: string | null;
    lock_reason?: string | null;
    rating: number;
    total_sales: number;
    total_products: number;
    created_at: string;
    updated_at: string;
    owner?: Customer;
    products?: StoreProduct[];
}

export interface StoreProduct {
    id: number;
    store_id: number;
    name: string;
    description: string;
    price: number;
    content: string;
    images?: string[];
    is_sold: boolean;
    is_active: boolean;
    is_deleted: boolean;
    deleted_by?: number;
    sold_at?: string;
    deleted_at?: string;
    delete_reason?: string;
    created_at: string;
    updated_at: string;
    store?: PersonalStore;
}

export interface IntermediateTransaction {
    id: number;
    transaction_code?: string;
    // Marketplace transaction fields
    buyer_id?: number;
    seller_id?: number;
    // Wallet transaction fields
    customer_id?: number;
    type?: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'fee' | 'refund';
    payment_method?: string;
    withdrawal_info?: {
        bank_name: string;
        account_number: string;
        account_holder: string;
    };
    recipient_id?: number;
    sender_id?: number;
    // Common fields
    amount: number;
    fee: number;
    description: string;
    status: 'pending' | 'confirmed' | 'seller_sent' | 'buyer_received' | 'completed' | 'disputed' | 'cancelled' | 'expired';
    duration_hours?: number;
    expires_at?: string;
    confirmed_at?: string;
    seller_sent_at?: string;
    buyer_received_at?: string;
    completed_at?: string;
    created_at: string;
    updated_at: string;
    // Relationships
    customer?: Customer;
    buyer?: Customer;
    seller?: Customer;
    recipient?: Customer;
    sender?: Customer;
    dispute?: Dispute;
    chat?: TransactionChat[];
    transactionFee?: {
        id: number;
        amount: number;
    };
}

export interface StoreTransaction {
    id: number;
    transaction_code: string;
    buyer_id: number;
    seller_id: number;
    product_id: number;
    amount: number;
    fee: number;
    status: 'processing' | 'completed' | 'disputed' | 'cancelled';
    completed_at?: string;
    auto_complete_at: string;
    buyer_early_complete: boolean;
    created_at: string;
    updated_at: string;
    buyer?: Customer;
    seller?: Customer;
    product?: StoreProduct;
}

export interface Dispute {
    id: number;
    transaction_type: 'intermediate' | 'store';
    transaction_id: number;
    created_by: number;
    reason: string;
    evidence?: string[];
    status: 'pending' | 'processing' | 'resolved' | 'cancelled';
    assigned_to?: number;
    resolution?: string;
    result?: 'refund_buyer' | 'pay_seller' | 'partial_refund';
    resolved_at?: string;
    created_at: string;
    updated_at: string;
    creator?: Customer;
    assignedModerator?: Customer;
    transaction?: IntermediateTransaction;
}

export interface GeneralChat {
    id: number;
    customer_id: number;
    message: string;
    message_type: 'TEXT' | 'IMAGE' | 'FILE';
    room: string;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    customer?: Customer;
}

export interface TransactionChat {
    id: number;
    transaction_id: number;
    transaction_type: 'intermediate' | 'store';
    sender_id: number;
    message: string;
    images?: string[];
    created_at: string;
    updated_at: string;
    transaction?: IntermediateTransaction;
    sender?: Customer;
}

export interface PointTransaction {
    id: number;
    customer_id: number;
    type: 'earned' | 'earn' | 'referral_bonus' | 'sent' | 'received' | 'exchanged' | 'spend' | 'transfer' | 'admin_adjust';
    amount: number;
    description: string;
    reference_id?: number;
    reference_type?: string;
    created_at: string;
    updated_at: string;
    customer?: Customer;
}

export interface Referral {
    id: number;
    referrer_id: number;
    referred_id: number;
    referral_code: string;
    total_points_earned: number;
    first_transaction_bonus_given: boolean;
    created_at: string;
    updated_at: string;
    referrer?: Customer;
    referred?: Customer;
}

// Transaction Fee Configuration
export interface TransactionFee {
    id: number;
    min_amount: number;
    max_amount: number;
    base_fee: number;
    percentage_fee: number;
    daily_fee_percentage: number;
    point_reward: number;
    created_at: string;
    updated_at: string;
}

// System Settings
export interface SystemSetting {
    id: number;
    key: string;
    value: string;
    type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
    description?: string;
    created_at: string;
    updated_at: string;
}

// Daily Chat Limit
export interface DailyChatLimit {
    id: number;
    customer_id: number;
    date: string;
    general_chat_count: number;
    transaction_image_count: number;
    max_general_chat: number;
    max_transaction_images: number;
    created_at: string;
    updated_at: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
    data: T;
    message?: string;
    success: boolean;
    errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = unknown> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

// Form types
export interface LoginForm extends Record<string, unknown> {
    username: string;
    password: string;
    remember?: boolean;
}

export interface RegisterForm extends Record<string, unknown> {
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
    referral_code?: string;
}

export interface CreateTransactionForm extends Record<string, unknown> {
    role: 'BUYER' | 'SELLER';
    partner_username: string;
    amount: number;
    description: string;
    duration_hours: number;
}

export interface CreateStoreProductForm {
    name: string;
    description: string;
    content: string;
    price: number;
    images?: File[];
}

export interface ChatMessage {
    id: number;
    customer_id: number;
    message: string;
    message_type: 'TEXT' | 'IMAGE' | 'FILE';
    created_at: string;
    customer?: Customer;
}

export interface TransactionChatMessage extends ChatMessage {
    transaction_id: number;
    is_system_message: boolean;
}

export interface GeneralChatMessage extends ChatMessage {
    room: string;
    is_deleted: boolean;
    attached_product?: StoreProduct;
}

// Notification types
export interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    read_at?: string;
    created_at: string;
}

// Stats for dashboard
export interface CustomerStats {
    total_transactions: number;
    completed_transactions: number;
    total_spent: number;
    total_earned: number;
    current_balance: number;
    current_points: number;
    referrals_count: number;
    store_sales: number;
}

// KYC Data structure
export interface KYCData {
    full_name?: string;
    id_number?: string;
    id_type?: 'CITIZEN_ID' | 'PASSPORT' | 'DRIVER_LICENSE';
    id_front_image?: string;
    id_back_image?: string;
    selfie_image?: string;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    verified_at?: string;
    rejection_reason?: string;
}
