import { categoryHandlers } from '../api/queries/categories';
import { productHandlers } from '../api/queries/products';
import { profileHandlers } from '../api/queries/profiles';
import { dashboardHandlers } from '../api/queries/dashboard';
import { searchHandlers } from '../api/queries/search';
import { http, HttpResponse } from 'msw';
import type { Order } from '../types';

// Mock orders data
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

// Orders handlers
const orderHandlers = [
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

// Combine all handlers
export const handlers = [
    ...dashboardHandlers,
    ...categoryHandlers,
    ...productHandlers,
    ...profileHandlers,
    ...orderHandlers,
    ...searchHandlers,
];