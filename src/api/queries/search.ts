import { http, HttpResponse } from 'msw';
import type { SearchResponse, RecentSearch, SearchAnalytics } from '../../types';

// Mock search analytics data
let searchAnalytics: SearchAnalytics = {
    totalSearches: 0,
    popularQueries: [],
    noResultsQueries: [],
    averageResultsPerQuery: 0,
};

// Mock recent searches (in real app, this would be per user)
let recentSearches: RecentSearch[] = [];

// Helper function to search in text fields
const searchInText = (text: string, query: string): boolean => {
    return text.toLowerCase().includes(query.toLowerCase());
};

// Helper function to highlight search terms
const highlightText = (text: string, query: string): string => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
};

// Helper function to calculate search score
const calculateScore = (item: any, query: string, type: string): number => {
    let score = 0;
    const lowerQuery = query.toLowerCase();

    // Exact matches get highest score
    if (item.name?.toLowerCase() === lowerQuery) score += 100;
    if (item.title?.toLowerCase() === lowerQuery) score += 100;

    // Starts with query gets high score
    if (item.name?.toLowerCase().startsWith(lowerQuery)) score += 50;
    if (item.title?.toLowerCase().startsWith(lowerQuery)) score += 50;

    // Contains query gets medium score
    if (item.name?.toLowerCase().includes(lowerQuery)) score += 25;
    if (item.title?.toLowerCase().includes(lowerQuery)) score += 25;
    if (item.description?.toLowerCase().includes(lowerQuery)) score += 10;
    if (item.email?.toLowerCase().includes(lowerQuery)) score += 15;

    // Type-specific scoring
    switch (type) {
        case 'product':
            if (item.status === 'active') score += 5;
            break;
        case 'profile':
            if (item.role === 'admin') score += 5;
            break;
    }

    return score;
};

// Update search analytics
const updateSearchAnalytics = (query: string, resultsCount: number) => {
    searchAnalytics.totalSearches++;

    // Update popular queries
    const existingQuery = searchAnalytics.popularQueries.find((q: any) => q.query === query);
    if (existingQuery) {
        existingQuery.count++;
        existingQuery.lastSearched = new Date().toISOString();
    } else {
        searchAnalytics.popularQueries.push({
            query,
            count: 1,
            lastSearched: new Date().toISOString(),
        });
    }

    // Sort popular queries by count
    searchAnalytics.popularQueries.sort((a: any, b: any) => b.count - a.count);
    searchAnalytics.popularQueries = searchAnalytics.popularQueries.slice(0, 10);

    // Track no results queries
    if (resultsCount === 0 && !searchAnalytics.noResultsQueries.includes(query)) {
        searchAnalytics.noResultsQueries.push(query);
    }

    // Update average results per query
    const totalResults = searchAnalytics.popularQueries.reduce((sum: number, q: any) => sum + q.count, 0);
    searchAnalytics.averageResultsPerQuery = totalResults / searchAnalytics.totalSearches;
};

// Add to recent searches
const addToRecentSearches = (query: string, resultsCount: number) => {
    const recentSearch: RecentSearch = {
        id: Date.now().toString(),
        query,
        timestamp: new Date().toISOString(),
        resultsCount,
    };

    // Remove duplicate if exists
    recentSearches = recentSearches.filter(s => s.query !== query);

    // Add to beginning
    recentSearches.unshift(recentSearch);

    // Keep only last 10
    recentSearches = recentSearches.slice(0, 10);
};

export const searchHandlers = [
    // Global search endpoint
    http.get('/api/search', async ({ request }) => {
        const url = new URL(request.url);
        const query = url.searchParams.get('q') || '';
        const type = url.searchParams.get('type');
        // const page = parseInt(url.searchParams.get('page') || '1');
        // const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
        // const sortBy = url.searchParams.get('sortBy') || 'relevance';
        // const sortOrder = url.searchParams.get('sortOrder') || 'desc';

        const startTime = Date.now();

        // Mock data for search (in real app, this would come from a search service)
        const mockProducts = [
            { id: '1', name: 'Wireless Headphones', description: 'High-quality wireless headphones', price: 199.99, status: 'active', stock: 50, imageUrl: '/images/headphones.jpg' },
            { id: '2', name: 'Smartphone', description: 'Latest smartphone with advanced features', price: 699.99, status: 'active', stock: 25, imageUrl: '/images/phone.jpg' },
            { id: '3', name: 'Laptop', description: 'Powerful laptop for work and gaming', price: 1299.99, status: 'active', stock: 15, imageUrl: '/images/laptop.jpg' },
        ];

        const mockCategories = [
            { id: '1', name: 'Electronics', slug: 'electronics', parent_id: null, created_at: '2024-01-01' },
            { id: '2', name: 'Computers', slug: 'computers', parent_id: '1', created_at: '2024-01-01' },
            { id: '3', name: 'Audio', slug: 'audio', parent_id: '1', created_at: '2024-01-01' },
        ];

        const mockProfiles = [
            { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', avatar: '/avatars/john.jpg' },
            { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', avatar: '/avatars/jane.jpg' },
        ];

        const mockOrders = [
            { id: '1', customerName: 'Alice Johnson', customerEmail: 'alice@example.com', total: 299.99, status: 'delivered' },
            { id: '2', customerName: 'Bob Wilson', customerEmail: 'bob@example.com', total: 599.99, status: 'processing' },
        ];

        const results: SearchResponse['results'] = {
            products: [],
            categories: [],
            profiles: [],
            orders: [],
        };

        if (!query) {
            const response: SearchResponse = {
                query,
                total: 0,
                results,
                took: Date.now() - startTime,
            };
            return HttpResponse.json(response);
        }

        // Search products
        if (!type || type === 'product') {
            const productResults = mockProducts
                .filter((product: any) =>
                    searchInText(product.name, query) ||
                    searchInText(product.description, query)
                )
                .map((product: any) => ({
                    id: product.id,
                    title: highlightText(product.name, query),
                    description: highlightText(product.description, query),
                    type: 'product' as const,
                    url: `/products/${product.id}`,
                    imageUrl: product.imageUrl,
                    metadata: {
                        price: product.price,
                        status: product.status,
                        stock: product.stock,
                    },
                    score: calculateScore(product, query, 'product'),
                }));

            results.products = productResults;
        }

        // Search categories
        if (!type || type === 'category') {
            const categoryResults = mockCategories
                .filter((category: any) =>
                    searchInText(category.name, query)
                )
                .map((category: any) => ({
                    id: category.id,
                    title: highlightText(category.name, query),
                    description: `Category • ${category.parent_id ? 'Subcategory' : 'Root Category'}`,
                    type: 'category' as const,
                    url: `/categories/${category.slug}`,
                    metadata: {
                        parent_id: category.parent_id,
                        created_at: category.created_at,
                    },
                    score: calculateScore(category, query, 'category'),
                }));

            results.categories = categoryResults;
        }

        // Search profiles
        if (!type || type === 'profile') {
            const profileResults = mockProfiles
                .filter((profile: any) =>
                    searchInText(profile.name, query) ||
                    searchInText(profile.email, query) ||
                    searchInText(profile.role, query)
                )
                .map((profile: any) => ({
                    id: profile.id,
                    title: highlightText(profile.name, query),
                    description: `${highlightText(profile.email, query)} • ${profile.role}`,
                    type: 'profile' as const,
                    url: `/profiles/${profile.id}`,
                    imageUrl: profile.avatar,
                    metadata: {
                        role: profile.role,
                        email: profile.email,
                    },
                    score: calculateScore(profile, query, 'profile'),
                }));

            results.profiles = profileResults;
        }

        // Search orders
        if (!type || type === 'order') {
            const orderResults = mockOrders
                .filter((order: any) =>
                    searchInText(order.customerName, query) ||
                    searchInText(order.customerEmail, query) ||
                    searchInText(order.id, query)
                )
                .map((order: any) => ({
                    id: order.id,
                    title: `Order #${order.id}`,
                    description: `${highlightText(order.customerName, query)} • $${order.total} • ${order.status}`,
                    type: 'order' as const,
                    url: `/orders/${order.id}`,
                    metadata: {
                        customerName: order.customerName,
                        customerEmail: order.customerEmail,
                        total: order.total,
                        status: order.status,
                    },
                    score: calculateScore(order, query, 'order'),
                }));

            results.orders = orderResults;
        }

        // Sort results by score
        Object.keys(results).forEach(key => {
            const resultArray = results[key as keyof typeof results];
            resultArray.sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
        });

        const totalResults = Object.values(results).reduce((sum: number, arr: any) => sum + arr.length, 0);

        // Update analytics
        updateSearchAnalytics(query, totalResults);
        addToRecentSearches(query, totalResults);

        const response: SearchResponse = {
            query,
            total: totalResults,
            results,
            suggestions: totalResults === 0 ? [
                'Try different keywords',
                'Check spelling',
                'Use more general terms',
            ] : undefined,
            took: Date.now() - startTime,
        };

        return HttpResponse.json(response);
    }),

    // Get recent searches
    http.get('/api/search/recent', () => {
        return HttpResponse.json(recentSearches);
    }),

    // Get search analytics
    http.get('/api/search/analytics', () => {
        return HttpResponse.json(searchAnalytics);
    }),

    // Clear recent searches
    http.delete('/api/search/recent', () => {
        recentSearches = [];
        return HttpResponse.json({ success: true });
    }),
];