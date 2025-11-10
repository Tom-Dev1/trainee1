import { http, HttpResponse } from 'msw';
import type { Category } from '../../types';
import { toSlug } from '../../utils/slug';

// Static category data following the strict type
let mockCategories: Category[] = [
    {
        id: 'b35d8a10-13af-4bce-8cc1-7a32cc5a8b5b',
        name: 'Đồ Gia Dụng',
        slug: 'do-gia-dung',
        parent_id: null,
        created_at: '2025-10-31T13:20:14.029Z',
        updated_at: '2025-10-31T13:20:14.029Z',
    },
    {
        id: 'c45e9b21-24bf-5cdf-9dd2-8b43dd6b9c6c',
        name: 'Điện Tử',
        slug: 'dien-tu',
        parent_id: null,
        created_at: '2025-10-31T13:21:14.029Z',
        updated_at: '2025-10-31T13:21:14.029Z',
    },
    {
        id: 'd56f0c32-35cf-6def-0ee3-9c54ee7c0d7d',
        name: 'Máy Tính',
        slug: 'may-tinh',
        parent_id: 'c45e9b21-24bf-5cdf-9dd2-8b43dd6b9c6c',
        created_at: '2025-10-31T13:22:14.029Z',
        updated_at: '2025-10-31T13:22:14.029Z',
    },
    {
        id: 'e67g1d43-46df-7efg-1ff4-0d65ff8d1e8e',
        name: 'Điện Thoại',
        slug: 'dien-thoai',
        parent_id: 'c45e9b21-24bf-5cdf-9dd2-8b43dd6b9c6c',
        created_at: '2025-10-31T13:23:14.029Z',
        updated_at: '2025-10-31T13:23:14.029Z',
    },
    {
        id: 'f78h2e54-57eg-8fgh-2gg5-1e76gg9e2f9f',
        name: 'Thời Trang',
        slug: 'thoi-trang',
        parent_id: null,
        created_at: '2025-10-31T13:24:14.029Z',
        updated_at: '2025-10-31T13:24:14.029Z',
    },
];

// Helper function to build category tree from flat structure
export const buildCategoryTree = (categories: Category[]): Category[] => {
    const categoryMap = new Map<string, Category & { children?: Category[] }>();
    const rootCategories: (Category & { children?: Category[] })[] = [];

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

// Helper function to generate unique ID
const generateId = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const categoryHandlers = [
    // Get all categories (flat structure)
    http.get('/api/categories', () => {
        return HttpResponse.json(mockCategories);
    }),

    // Get categories as tree
    http.get('/api/categories/tree', () => {
        const treeCategories = buildCategoryTree(mockCategories);
        return HttpResponse.json(treeCategories);
    }),

    // Get single category by slug
    http.get('/api/categories/:slug', ({ params }) => {
        const category = mockCategories.find(c => c.slug === params.slug);
        if (!category) {
            return new HttpResponse(null, { status: 404 });
        }
        return HttpResponse.json(category);
    }),

    // Create new category
    http.post('/api/categories', async ({ request }) => {
        const data = await request.json() as { name: string; parent_id?: string | null };

        const newCategory: Category = {
            id: generateId(),
            name: data.name,
            slug: toSlug(data.name),
            parent_id: data.parent_id || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        mockCategories.push(newCategory);
        return HttpResponse.json(newCategory, { status: 201 });
    }),

    // Update category
    http.patch('/api/categories/:id', async ({ params, request }) => {
        const data = await request.json() as Partial<{ name: string; parent_id: string | null }>;
        const categoryIndex = mockCategories.findIndex(c => c.id === params.id);

        if (categoryIndex === -1) {
            return new HttpResponse(null, { status: 404 });
        }

        const updatedCategory = {
            ...mockCategories[categoryIndex],
            ...data,
            updated_at: new Date().toISOString(),
        };

        if (data.name) {
            updatedCategory.slug = toSlug(data.name);
        }

        mockCategories[categoryIndex] = updatedCategory;
        return HttpResponse.json(updatedCategory);
    }),

    // Delete category
    http.delete('/api/categories/:id', ({ params }) => {
        const categoryIndex = mockCategories.findIndex(c => c.id === params.id);

        if (categoryIndex === -1) {
            return new HttpResponse(null, { status: 404 });
        }

        // Check if category has children
        const hasChildren = mockCategories.some(c => c.parent_id === params.id);
        if (hasChildren) {
            return HttpResponse.json(
                { error: 'Cannot delete category with children' },
                { status: 400 }
            );
        }

        mockCategories.splice(categoryIndex, 1);
        return HttpResponse.json({ success: true });
    }),
];