import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SearchResponse, SearchQuery, RecentSearch, SearchAnalytics } from '../types';

// API functions
const searchApi = {
    search: async (searchQuery: SearchQuery): Promise<SearchResponse> => {
        const params = new URLSearchParams();
        params.append('q', searchQuery.query);

        if (searchQuery.filters?.type) {
            searchQuery.filters.type.forEach((type: string) => params.append('type', type));
        }
        if (searchQuery.page) params.append('page', searchQuery.page.toString());
        if (searchQuery.pageSize) params.append('pageSize', searchQuery.pageSize.toString());
        if (searchQuery.sortBy) params.append('sortBy', searchQuery.sortBy);
        if (searchQuery.sortOrder) params.append('sortOrder', searchQuery.sortOrder);

        const response = await fetch(`/api/search?${params}`);
        if (!response.ok) throw new Error('Search failed');
        return response.json();
    },

    getRecentSearches: async (): Promise<RecentSearch[]> => {
        const response = await fetch('/api/search/recent');
        if (!response.ok) throw new Error('Failed to fetch recent searches');
        return response.json();
    },

    getAnalytics: async (): Promise<SearchAnalytics> => {
        const response = await fetch('/api/search/analytics');
        if (!response.ok) throw new Error('Failed to fetch search analytics');
        return response.json();
    },

    clearRecentSearches: async (): Promise<{ success: boolean }> => {
        const response = await fetch('/api/search/recent', { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to clear recent searches');
        return response.json();
    },
};

// Search hook
export const useSearch = (searchQuery: SearchQuery, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['search', searchQuery],
        queryFn: () => searchApi.search(searchQuery),
        enabled: enabled && !!searchQuery.query,
        staleTime: 30 * 1000, // 30 seconds
        retry: 1,
    });
};

// Recent searches hook
export const useRecentSearches = () => {
    return useQuery({
        queryKey: ['search', 'recent'],
        queryFn: searchApi.getRecentSearches,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Search analytics hook
export const useSearchAnalytics = () => {
    return useQuery({
        queryKey: ['search', 'analytics'],
        queryFn: searchApi.getAnalytics,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Clear recent searches mutation
export const useClearRecentSearches = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: searchApi.clearRecentSearches,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['search', 'recent'] });
        },
    });
};

// Debounced search hook
export const useDebouncedSearch = (query: string, delay: number = 300) => {
    const [debouncedQuery, setDebouncedQuery] = React.useState(query);

    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [query, delay]);

    return debouncedQuery;
};

// Search suggestions hook (for autocomplete)
export const useSearchSuggestions = (query: string) => {
    const { data: recentSearches } = useRecentSearches();
    const { data: analytics } = useSearchAnalytics();

    return React.useMemo(() => {
        if (!query || query.length < 2) return [];

        const suggestions = new Set<string>();

        // Add matching recent searches
        recentSearches?.forEach(search => {
            if (search.query.toLowerCase().includes(query.toLowerCase())) {
                suggestions.add(search.query);
            }
        });

        // Add matching popular queries
        analytics?.popularQueries.forEach((popularQuery: any) => {
            if (popularQuery.query.toLowerCase().includes(query.toLowerCase())) {
                suggestions.add(popularQuery.query);
            }
        });

        return Array.from(suggestions).slice(0, 5);
    }, [query, recentSearches, analytics]);
};