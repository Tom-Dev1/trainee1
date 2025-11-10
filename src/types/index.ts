export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    categoryId: string;
    imageUrl: string[];
    stock: number;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    parent_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface CategoryFormData {
    name: string;
    parent_id?: string | null;
}

export interface CategoryTreeNode {
    key: string;
    title: React.ReactNode;
    children?: CategoryTreeNode[];
    category: Category;
}

// Ant Design Menu Item type
export interface MenuItemType {
    key: string;
    label: React.ReactNode;
    icon?: React.ReactNode;
    children?: MenuItemType[];
    type?: 'group' | 'divider';
    category?: Category; // For category items
    path?: string; // For static menu items
}

// Context menu item type
export type MenuItemContext =
    | { type: 'static'; path: string }
    | { type: 'category'; category: Category };

export interface Profile {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    created_at: string;
    updated_at: string;
}

export interface ContextMenuAction {
    key: string;
    label: string;
    icon: React.ReactNode;
    danger?: boolean;
}

export interface DynamicFormField {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'date' | 'email' | 'hidden' | 'upload';
    required?: boolean;
    options?: { label: string; value: string }[];
    placeholder?: string;
    autoGenerate?: boolean; // For slug generation
    disabled?: boolean;
    maxCount?: number; // For upload field: max number of files
    accept?: string; // For upload field: accepted file types
    listType?: 'text' | 'picture' | 'picture-card'; // For upload field
}

export interface DynamicFormProps<T = Record<string, unknown>> {
    formData?: T;
    fields: DynamicFormField[];
    onSubmit: (values: T) => void;
    onCancel: () => void;
    loading?: boolean;
    title?: string;
    onValuesChange?: (values: Partial<T>) => void;
    isEditMode?: boolean;
}

export interface Order {
    id: string;
    customerName: string;
    customerEmail: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    total: number;
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    price: number;
}

export interface DashboardStats {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    totalCategories: number;
}export
    interface SearchResult {
    id: string;
    title: string;
    description: string;
    type: 'product' | 'category' | 'profile' | 'order';
    url: string;
    imageUrl?: string;
    metadata?: Record<string, unknown>;
    score?: number;
}

export interface SearchResponse {
    query: string;
    total: number;
    results: {
        products: SearchResult[];
        categories: SearchResult[];
        profiles: SearchResult[];
        orders: SearchResult[];
    };
    suggestions?: string[];
    took: number;
}

export interface SearchFilters {
    type?: ('product' | 'category' | 'profile' | 'order')[];
    dateRange?: {
        start: string;
        end: string;
    };
    priceRange?: {
        min: number;
        max: number;
    };
    status?: string[];
    categoryId?: string;
}

export interface SearchQuery {
    query: string;
    filters?: SearchFilters;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface RecentSearch {
    id: string;
    query: string;
    timestamp: string;
    resultsCount: number;
}

export interface SearchAnalytics {
    totalSearches: number;
    popularQueries: Array<{
        query: string;
        count: number;
        lastSearched: string;
    }>;
    noResultsQueries: string[];
    averageResultsPerQuery: number;
}