import { http, HttpResponse } from 'msw';
import type { Product } from '../../types';

// Mock products data
let mockProducts: Product[] = [
    {
        id: '1',
        name: 'Wireless Headphones',
        slug: 'wireless-headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 199.99,
        categoryId: 'c45e9b21-24bf-5cdf-9dd2-8b43dd6b9c6c',
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
        categoryId: 'e67g1d43-46df-7efg-1ff4-0d65ff8d1e8e',
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
        categoryId: 'd56f0c32-35cf-6def-0ee3-9c54ee7c0d7d',
        imageUrl: 'https://via.placeholder.com/300x300',
        stock: 15,
        status: 'active',
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
    },
];

export const productHandlers = [
    // Get all products with pagination and filters
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

    // Get single product by slug
    http.get('/api/products/:slug', ({ params }) => {
        const product = mockProducts.find(p => p.slug === params.slug);
        if (!product) {
            return new HttpResponse(null, { status: 404 });
        }
        return HttpResponse.json(product);
    }),

    // Create new product
    http.post('/api/products', async ({ request }) => {
        const data = await request.json() as Omit<Product, 'id' | 'slug' | 'createdAt' | 'updatedAt'>;

        const newProduct: Product = {
            ...data,
            id: Date.now().toString(),
            slug: data.name.toLowerCase().replace(/\s+/g, '-'),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        mockProducts.push(newProduct);
        return HttpResponse.json(newProduct, { status: 201 });
    }),

    // Update product
    http.patch('/api/products/:id', async ({ params, request }) => {
        const data = await request.json() as Partial<Product>;
        const productIndex = mockProducts.findIndex(p => p.id === params.id);

        if (productIndex === -1) {
            return new HttpResponse(null, { status: 404 });
        }

        const updatedProduct = {
            ...mockProducts[productIndex],
            ...data,
            updatedAt: new Date().toISOString(),
        };

        if (data.name) {
            updatedProduct.slug = data.name.toLowerCase().replace(/\s+/g, '-');
        }

        mockProducts[productIndex] = updatedProduct;
        return HttpResponse.json(updatedProduct);
    }),

    // Delete product
    http.delete('/api/products/:id', ({ params }) => {
        const productIndex = mockProducts.findIndex(p => p.id === params.id);

        if (productIndex === -1) {
            return new HttpResponse(null, { status: 404 });
        }

        mockProducts.splice(productIndex, 1);
        return HttpResponse.json({ success: true });
    }),
];