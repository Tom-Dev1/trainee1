import { http, HttpResponse } from 'msw';
import type { DashboardStats } from '../../types';

export const dashboardHandlers = [
    // Get dashboard stats
    http.get('/api/dashboard/stats', () => {
        const stats: DashboardStats = {
            totalProducts: 3,
            totalOrders: 2,
            totalRevenue: 2199.97,
            totalCategories: 5,
        };
        return HttpResponse.json(stats);
    }),
];