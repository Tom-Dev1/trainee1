import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { Profile } from '../types';

// API functions
const profilesApi = {
    getProfiles: async (params?: {
        page?: number;
        pageSize?: number;
        search?: string;
    }): Promise<{ data: Profile[]; total: number; page: number; pageSize: number }> => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
        if (params?.search) searchParams.append('search', params.search);

        const response = await fetch(`/api/profiles?${searchParams}`);
        if (!response.ok) throw new Error('Failed to fetch profiles');
        return response.json();
    },

    getProfile: async (id: string): Promise<Profile> => {
        const response = await fetch(`/api/profiles/${id}`);
        if (!response.ok) throw new Error('Failed to fetch profile');
        return response.json();
    },

    createProfile: async (data: Omit<Profile, 'id' | 'created_at' | 'updated_at'>): Promise<Profile> => {
        const response = await fetch('/api/profiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create profile');
        return response.json();
    },

    updateProfile: async (id: string, data: Partial<Profile>): Promise<Profile> => {
        const response = await fetch(`/api/profiles/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update profile');
        return response.json();
    },

    deleteProfile: async (id: string): Promise<{ success: boolean }> => {
        const response = await fetch(`/api/profiles/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete profile');
        return response.json();
    },
};

// Query hooks
export const useProfiles = (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
}) => {
    return useQuery({
        queryKey: ['profiles', params],
        queryFn: () => profilesApi.getProfiles(params),
        staleTime: 5 * 60 * 1000,
    });
};

export const useProfile = (id: string) => {
    return useQuery({
        queryKey: ['profiles', 'detail', id],
        queryFn: () => profilesApi.getProfile(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
};

// Mutation hooks
export const useCreateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: profilesApi.createProfile,
        onSuccess: () => {
            message.success('Profile created successfully');
            queryClient.invalidateQueries({ queryKey: ['profiles'] });
        },
        onError: () => {
            message.error('Failed to create profile');
        },
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Profile> }) =>
            profilesApi.updateProfile(id, data),
        onSuccess: () => {
            message.success('Profile updated successfully');
            queryClient.invalidateQueries({ queryKey: ['profiles'] });
        },
        onError: () => {
            message.error('Failed to update profile');
        },
    });
};

export const useDeleteProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: profilesApi.deleteProfile,
        onSuccess: () => {
            message.success('Profile deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['profiles'] });
        },
        onError: () => {
            message.error('Failed to delete profile');
        },
    });
};