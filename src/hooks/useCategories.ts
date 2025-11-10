import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { Category, CategoryFormData } from '../types';

// API functions
const categoriesApi = {
    getCategories: async (): Promise<Category[]> => {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        return response.json();
    },

    getCategoriesTree: async (): Promise<Category[]> => {
        const response = await fetch('/api/categories/tree');
        if (!response.ok) throw new Error('Failed to fetch categories tree');
        return response.json();
    },

    getCategory: async (slug: string): Promise<Category> => {
        const response = await fetch(`/api/categories/${slug}`);
        if (!response.ok) throw new Error('Failed to fetch category');
        return response.json();
    },

    createCategory: async (data: CategoryFormData): Promise<Category> => {
        const response = await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create category');
        return response.json();
    },

    updateCategory: async (id: string, data: Partial<CategoryFormData>): Promise<Category> => {
        const response = await fetch(`/api/categories/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update category');
        return response.json();
    },

    deleteCategory: async (id: string): Promise<{ success: boolean }> => {
        const response = await fetch(`/api/categories/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete category');
        return response.json();
    },
};

// Query hooks
export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: categoriesApi.getCategories,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useCategoriesTree = () => {
    return useQuery({
        queryKey: ['categories', 'tree'],
        queryFn: categoriesApi.getCategoriesTree,
        staleTime: 5 * 60 * 1000,
    });
};

export const useCategory = (slug: string) => {
    return useQuery({
        queryKey: ['categories', 'detail', slug],
        queryFn: () => categoriesApi.getCategory(slug),
        enabled: !!slug,
        staleTime: 5 * 60 * 1000,
    });
};

// Mutation hooks with optimistic updates
export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: categoriesApi.createCategory,
        onMutate: async (newCategory) => {
            await queryClient.cancelQueries({ queryKey: ['categories'] });
            const previousCategories = queryClient.getQueryData(['categories']);

            const tempCategory: Category = {
                id: `temp-${Date.now()}`,
                name: newCategory.name,
                slug: `temp-slug-${Date.now()}`,
                parent_id: newCategory.parent_id || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            queryClient.setQueryData(['categories'], (old: Category[] = []) => {
                return [...old, tempCategory];
            });

            return { previousCategories };
        },
        onError: (_, __, context) => {
            if (context?.previousCategories) {
                queryClient.setQueryData(['categories'], context.previousCategories);
            }
            message.error('Failed to create category');
        },
        onSuccess: () => {
            message.success('Category created successfully');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CategoryFormData> }) =>
            categoriesApi.updateCategory(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: ['categories'] });
            const previousCategories = queryClient.getQueryData(['categories']);

            queryClient.setQueryData(['categories'], (old: Category[] = []) => {
                return old.map(cat =>
                    cat.id === id
                        ? { ...cat, ...data, updated_at: new Date().toISOString() }
                        : cat
                );
            });

            return { previousCategories };
        },
        onError: (_, __, context) => {
            if (context?.previousCategories) {
                queryClient.setQueryData(['categories'], context.previousCategories);
            }
            message.error('Failed to update category');
        },
        onSuccess: () => {
            message.success('Category updated successfully');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: categoriesApi.deleteCategory,
        onMutate: async (deletedId) => {
            await queryClient.cancelQueries({ queryKey: ['categories'] });
            const previousCategories = queryClient.getQueryData(['categories']);

            queryClient.setQueryData(['categories'], (old: Category[] = []) => {
                return old.filter(cat => cat.id !== deletedId);
            });

            return { previousCategories };
        },
        onError: (_, __, context) => {
            if (context?.previousCategories) {
                queryClient.setQueryData(['categories'], context.previousCategories);
            }
            message.error('Failed to delete category');
        },
        onSuccess: () => {
            message.success('Category deleted successfully');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};