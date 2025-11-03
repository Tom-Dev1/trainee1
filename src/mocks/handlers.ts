import { http, HttpResponse } from 'msw';
import type { Product, Category, Order, DashboardStats } from '../types';

// Mock data
const mockProducts: Product[] = [
    {
        id: '1',
        name: 'Wireless Headphones',
        slug: 'wireless-headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 199.99,
        categoryId: '1',
        imageUrl: 'https://via.placeholder.com/300x300',
        stock: 50,
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: '2',
        name: 'Smartphone',
        slug: 'smartphone',
        description: 'Latest smartphone with advanced features',
        price: 699.99,
        categoryId: '1',
        imageUrl: 'https://via.placeholder.com/300x300',
        stock: 25,
        status: 'active',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
    },
    {
        id: '3',
        name: 'Laptop',
        slug: 'laptop',
        description: 'High-performance laptop for professionals',
        price: 1299.99,
        categoryId: '1',
        imageUrl: 'https://via.placeholder.com/300x300',
        stock: 15,
        status: 'active',
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
    },
];

// Flat category list for MSW
let mockCategoriesFlat: Category[] = [
    {
        id: '1',
        name: 'Electronics',
        slug: 'electronics',
        parent_id: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
    },
    {
        id: '2',
        name: 'Audio',
        slug: 'audio',
        parent_id: '1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
    },
    {
        id: '3',
        name: 'Computers',
        slug: 'computers',
        parent_id: '1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
    },
    {
        id: '4',
        name: 'Clothing',
        slug: 'clothing',
        parent_id: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
    },
    {
        id: '5',
        name: 'Headphones',
        slug: 'headphones',
        parent_id: '2',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
    },
];

// Helper function to build tree from flat list
const buildCategoryTree = (categories: Category[]): Category[] => {
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];

    // Create a map of all categories
    categories.forEach(cat => {
        categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Build the tree
    categories.forEach(cat => {
        const category = categoryMap.get(cat.id)!;
        if (cat.parent_id) {
            const parent = categoryMap.get(cat.parent_id);
            if (parent) {
                parent.children = parent.children || [];
                parent.children.push(category);
            }
        } else {
            rootCategories.push(category);
        }
    });

    return rootCategories;
};

const mockOrders: Order[] = [
    {
        id: '1',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        status: 'delivered',
        total: 199.99,
        items: [
            {
                id: '1',
                productId: '1',
                productName: 'Wireless Headphones',
                quantity: 1,
                price: 199.99,
            },
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-05T00:00:00Z',
    },
    {
        id: '2',
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        status: 'processing',
        total: 1999.98,
        items: [
            {
                id: '2',
                productId: '2',
                productName: 'Smartphone',
                quantity: 1,
                price: 699.99,
            },
            {
                id: '3',
                productId: '3',
                productName: 'Laptop',
                quantity: 1,
                price: 1299.99,
            },
        ],
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
    },
];

export const handlers = [
    // Dashboard stats
    http.get('/api/dashboard/stats', () => {
        const stats: DashboardStats = {
            totalProducts: mockProducts.length,
            totalOrders: mockOrders.length,
            totalRevenue: mockOrders.reduce((sum, order) => sum + order.total, 0),
            totalCategories: mockCategoriesFlat.length,
        };
        return HttpResponse.json(stats);
    }),

    // Products
    http.get('/api/products', ({ request }) => {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
        const search = url.searchParams.get('search') || '';
        const categoryId = url.searchParams.get('categoryId');

        let filteredProducts = mockProducts;

        if (search) {
            filteredProducts = filteredProducts.filter(product =>
                product.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (categoryId) {
            filteredProducts = filteredProducts.filter(product => product.categoryId === categoryId);
        }

        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

        return HttpResponse.json({
            data: paginatedProducts,
            total: filteredProducts.length,
            page,
            pageSize,
        });
    }),

    http.get('/api/products/:slug', ({ params }) => {
        const product = mockProducts.find(p => p.slug === params.slug);
        if (!product) {
            return new HttpResponse(null, { status: 404 });
        }
        return HttpResponse.json(product);
    }),

    // Categories
    http.get('/api/categories', () => {
        const treeCategories = buildCategoryTree(mockCategoriesFlat);
        return HttpResponse.json(treeCategories);
    }),

    http.get('/api/categories/:slug', ({ params }) => {
        const category = mockCategoriesFlat.find(c => c.slug === params.slug);
        if (!category) {
            return new HttpResponse(null, { status: 404 });
        }

        // Build tree structure for this category if it has children
        const categoryWithChildren = buildCategoryTree(mockCategoriesFlat)
            .find(c => c.slug === params.slug) ||
            buildCategoryTree(mockCategoriesFlat)
                .flatMap(c => c.children || [])
                .find(c => c.slug === params.slug) ||
            buildCategoryTree(mockCategoriesFlat)
                .flatMap(c => c.children || [])
                .flatMap(c => c.children || [])
                .find(c => c.slug === params.slug);

        return HttpResponse.json(categoryWithChildren || category);
    }),

    // Category CRUD operations
    http.post('/api/categories', async ({ request }) => {
        const data = await request.json() as { name: string; parent_id?: string | null };

        const newCategory: Category = {
            id: (mockCategoriesFlat.length + 1).toString(),
            name: data.name,
            slug: data.name.toLowerCase().replace(/\s+/g, '-'),
            parent_id: data.parent_id || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        mockCategoriesFlat.push(newCategory);
        return HttpResponse.json(newCategory, { status: 201 });
    }),

    http.patch('/api/categories/:id', async ({ params, request }) => {
        const data = await request.json() as Partial<{ name: string; parent_id: string | null }>;
        const categoryIndex = mockCategoriesFlat.findIndex(c => c.id === params.id);

        if (categoryIndex === -1) {
            return new HttpResponse(null, { status: 404 });
        }

        const updatedCategory = {
            ...mockCategoriesFlat[categoryIndex],
            ...data,
            updated_at: new Date().toISOString(),
        };

        if (data.name) {
            updatedCategory.slug = data.name.toLowerCase().replace(/\s+/g, '-');
        }

        mockCategoriesFlat[categoryIndex] = updatedCategory;
        return HttpResponse.json(updatedCategory);
    }),

    http.delete('/api/categories/:id', ({ params }) => {
        const categoryIndex = mockCategoriesFlat.findIndex(c => c.id === params.id);

        if (categoryIndex === -1) {
            return new HttpResponse(null, { status: 404 });
        }

        // Check if category has children
        const hasChildren = mockCategoriesFlat.some(c => c.parent_id === params.id);
        if (hasChildren) {
            return HttpResponse.json(
                { error: 'Cannot delete category with children' },
                { status: 400 }
            );
        }

        mockCategoriesFlat.splice(categoryIndex, 1);
        return HttpResponse.json({ success: true });
    }),

    // Orders
    http.get('/api/orders', ({ request }) => {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedOrders = mockOrders.slice(startIndex, endIndex);

        return HttpResponse.json({
            data: paginatedOrders,
            total: mockOrders.length,
            page,
            pageSize,
        });
    }),
];