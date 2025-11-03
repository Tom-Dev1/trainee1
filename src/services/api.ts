import type { Product, Category, Order, DashboardStats } from '../types';

const API_BASE_URL = '/api';

// Dashboard API
export const dashboardApi = {
    getStats: async (): Promise<DashboardStats> => {
        const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
        if (!response.ok) throw new Error('Failed to fetch dashboard stats');
        return response.json();
    },
};

// Products API
export const productsApi = {
    getProducts: async (params?: {
        page?: number;
        pageSize?: number;
        search?: string;
        categoryId?: string;
    }): Promise<{ data: Product[]; total: number; page: number; pageSize: number }> => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
        if (params?.search) searchParams.append('search', params.search);
        if (params?.categoryId) searchParams.append('categoryId', params.categoryId);

        const response = await fetch(`${API_BASE_URL}/products?${searchParams}`);
        if (!response.ok) throw new Error('Failed to fetch products');
        return response.json();
    },

    getProduct: async (slug: string): Promise<Product> => {
        const response = await fetch(`${API_BASE_URL}/products/${slug}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        return response.json();
    },
};

// Categories API
export const categoriesApi = {
    getCategories: async (): Promise<Category[]> => {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        return response.json();
    },

    getCategory: async (slug: string): Promise<Category> => {
        const response = await fetch(`${API_BASE_URL}/categories/${slug}`);
        if (!response.ok) throw new Error('Failed to fetch category');
        return response.json();
    },
};

// Orders API
export const ordersApi = {
    getOrders: async (params?: {
        page?: number;
        pageSize?: number;
    }): Promise<{ data: Order[]; total: number; page: number; pageSize: number }> => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

        const response = await fetch(`${API_BASE_URL}/orders?${searchParams}`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        return response.json();
    },
};