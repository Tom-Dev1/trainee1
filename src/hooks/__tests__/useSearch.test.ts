import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSearch } from '../useSearch';
import React from 'react';

// Mock fetch
global.fetch = jest.fn();

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client= { queryClient } >
        { children }
        </QueryClientProvider>
    );
};

describe('useSearch', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should not make API call when query is empty', () => {
        const { result } = renderHook(
            () => useSearch({ query: '' }),
            { wrapper: createWrapper() }
        );

        expect(fetch).not.toHaveBeenCalled();
        expect(result.current.data).toBeUndefined();
    });

    it('should construct correct API URL with query parameters', () => {
        const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                query: 'test',
                total: 0,
                results: { products: [], categories: [], profiles: [], orders: [] },
                took: 10
            }),
        } as Response);

        renderHook(
            () => useSearch({
                query: 'test',
                filters: { type: ['product'] },
                page: 1,
                pageSize: 10
            }),
            { wrapper: createWrapper() }
        );

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/search?q=test&type=product&page=1&pageSize=10')
        );
    });
});