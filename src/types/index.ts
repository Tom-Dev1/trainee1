export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    categoryId: string;
    imageUrl: string;
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
    children?: Category[];
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
}