import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { Category, CategoryFormData } from '../types';
import { categoriesApi } from '../services/api';
import { categoriesStorage } from '../services/localStorage';

// Query hooks
export const useCategories = () => {
    return useQuery({
        queryKey: ['categories', 'tree'],
        queryFn: categoriesApi.getCategories,
        staleTime: 5 * 60 * 1000, // 5 minutes
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
        mutationFn: async (data: CategoryFormData) => {
            try {
                // Try MSW first
                const response = await fetch('/api/categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });

                if (!response.ok) throw new Error('MSW not available');
                return response.json();
            } catch {
                // Fallback to localStorage
                return categoriesStorage.addCategory(data);
            }
        },
        onMutate: async (newCategory) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['categories'] });

            // Snapshot previous value
            const previousCategories = queryClient.getQueryData(['categories', 'tree']);

            // Optimistically update
            const tempCategory: Category = {
                id: `temp-${Date.now()}`,
                name: newCategory.name,
                slug: `temp-slug-${Date.now()}`,
                parent_id: newCategory.parent_id || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            queryClient.setQueryData(['categories', 'tree'], (old: Category[] = []) => {
                return [...old, tempCategory];
            });

            return { previousCategories };
        },
        onError: (_, __, context) => {
            // Rollback on error
            if (context?.previousCategories) {
                queryClient.setQueryData(['categories', 'tree'], context.previousCategories);
            }
            message.error('Failed to create category');
        },
        onSuccess: () => {
            message.success('Category created successfully');
        },
        onSettled: () => {
            // Refetch to get the real data
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<CategoryFormData> }) => {
            try {
                // Try MSW first
                const response = await fetch(`/api/categories/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });

                if (!response.ok) throw new Error('MSW not available');
                return response.json();
            } catch {
                // Fallback to localStorage
                return categoriesStorage.updateCategory(id, data);
            }
        },
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: ['categories'] });

            const previousCategories = queryClient.getQueryData(['categories', 'tree']);

            // Optimistically update
            queryClient.setQueryData(['categories', 'tree'], (old: Category[] = []) => {
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
                queryClient.setQueryData(['categories', 'tree'], context.previousCategories);
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
        mutationFn: async (id: string) => {
            try {
                // Try MSW first
                const response = await fetch(`/api/categories/${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) throw new Error('MSW not available');
                return { success: true };
            } catch {
                // Fallback to localStorage
                const success = categoriesStorage.deleteCategory(id);
                if (!success) throw new Error('Failed to delete category');
                return { success };
            }
        },
        onMutate: async (deletedId) => {
            await queryClient.cancelQueries({ queryKey: ['categories'] });

            const previousCategories = queryClient.getQueryData(['categories', 'tree']);

            // Optimistically update
            queryClient.setQueryData(['categories', 'tree'], (old: Category[] = []) => {
                const removeCategory = (categories: Category[]): Category[] => {
                    return categories.filter(cat => {
                        if (cat.id === deletedId) return false;
                        if (cat.children) {
                            cat.children = removeCategory(cat.children);
                        }
                        return true;
                    });
                };
                return removeCategory(old);
            });

            return { previousCategories };
        },
        onError: (_, __, context) => {
            if (context?.previousCategories) {
                queryClient.setQueryData(['categories', 'tree'], context.previousCategories);
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