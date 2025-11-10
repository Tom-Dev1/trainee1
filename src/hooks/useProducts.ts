import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { Product } from '../types';

// API functions
const productsApi = {
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

        const response = await fetch(`/api/products?${searchParams}`);
        if (!response.ok) throw new Error('Failed to fetch products');
        return response.json();
    },

    getProduct: async (slug: string): Promise<Product> => {
        const response = await fetch(`/api/products/${slug}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        return response.json();
    },

    createProduct: async (data: Omit<Product, 'id' | 'slug' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create product');
        return response.json();
    },

    updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
        const response = await fetch(`/api/products/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update product');
        return response.json();
    },

    deleteProduct: async (id: string): Promise<{ success: boolean }> => {
        const response = await fetch(`/api/products/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete product');
        return response.json();
    },
};

// Query hooks
export const useProducts = (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    categoryId?: string;
}) => {
    return useQuery({
        queryKey: ['products', params],
        queryFn: () => productsApi.getProducts(params),
        staleTime: 5 * 60 * 1000,
    });
};

export const useProduct = (slug: string) => {
    return useQuery({
        queryKey: ['products', 'detail', slug],
        queryFn: () => productsApi.getProduct(slug),
        enabled: !!slug,
        staleTime: 5 * 60 * 1000,
    });
};

// Mutation hooks
export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: productsApi.createProduct,
        onSuccess: () => {
            message.success('Product created successfully');
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: () => {
            message.error('Failed to create product');
        },
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
            productsApi.updateProduct(id, data),
        onSuccess: () => {
            message.success('Product updated successfully');
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: () => {
            message.error('Failed to update product');
        },
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: productsApi.deleteProduct,
        onSuccess: () => {
            message.success('Product deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: () => {
            message.error('Failed to delete product');
        },
    });
};