import type { Category } from '../types';

/**
 * Mock data với 20 categories có cấu trúc tree
 * Dùng để test NavigationMenu component
 */
export const mockCategories: Category[] = [
    // Root categories (5)
    {
        id: 'cat-001',
        name: 'Điện Tử',
        slug: 'dien-tu',
        parent_id: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
    },
    {
        id: 'cat-002',
        name: 'Thời Trang',
        slug: 'thoi-trang',
        parent_id: null,
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
    },
    {
        id: 'cat-003',
        name: 'Đồ Gia Dụng',
        slug: 'do-gia-dung',
        parent_id: null,
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z',
    },
    {
        id: 'cat-004',
        name: 'Thể Thao',
        slug: 'the-thao',
        parent_id: null,
        created_at: '2024-01-04T00:00:00Z',
        updated_at: '2024-01-04T00:00:00Z',
    },
    {
        id: 'cat-005',
        name: 'Sách & Văn Phòng Phẩm',
        slug: 'sach-van-phong-pham',
        parent_id: null,
        created_at: '2024-01-05T00:00:00Z',
        updated_at: '2024-01-05T00:00:00Z',
    },

    // Subcategories của Điện Tử (3)
    {
        id: 'cat-006',
        name: 'Máy Tính',
        slug: 'may-tinh',
        parent_id: 'cat-001',
        created_at: '2024-01-06T00:00:00Z',
        updated_at: '2024-01-06T00:00:00Z',
    },
    {
        id: 'cat-007',
        name: 'Điện Thoại',
        slug: 'dien-thoai',
        parent_id: 'cat-001',
        created_at: '2024-01-07T00:00:00Z',
        updated_at: '2024-01-07T00:00:00Z',
    },
    {
        id: 'cat-008',
        name: 'Tai Nghe',
        slug: 'tai-nghe',
        parent_id: 'cat-001',
        created_at: '2024-01-08T00:00:00Z',
        updated_at: '2024-01-08T00:00:00Z',
    },

    // Subcategories của Thời Trang (3)
    {
        id: 'cat-009',
        name: 'Quần Áo Nam',
        slug: 'quan-ao-nam',
        parent_id: 'cat-002',
        created_at: '2024-01-09T00:00:00Z',
        updated_at: '2024-01-09T00:00:00Z',
    },
    {
        id: 'cat-010',
        name: 'Quần Áo Nữ',
        slug: 'quan-ao-nu',
        parent_id: 'cat-002',
        created_at: '2024-01-10T00:00:00Z',
        updated_at: '2024-01-10T00:00:00Z',
    },
    {
        id: 'cat-011',
        name: 'Giày Dép',
        slug: 'giay-dep',
        parent_id: 'cat-002',
        created_at: '2024-01-11T00:00:00Z',
        updated_at: '2024-01-11T00:00:00Z',
    },

    // Subcategories của Đồ Gia Dụng (2)
    {
        id: 'cat-012',
        name: 'Bếp & Nấu Ăn',
        slug: 'bep-nau-an',
        parent_id: 'cat-003',
        created_at: '2024-01-12T00:00:00Z',
        updated_at: '2024-01-12T00:00:00Z',
    },
    {
        id: 'cat-013',
        name: 'Nội Thất',
        slug: 'noi-that',
        parent_id: 'cat-003',
        created_at: '2024-01-13T00:00:00Z',
        updated_at: '2024-01-13T00:00:00Z',
    },

    // Subcategories của Thể Thao (2)
    {
        id: 'cat-014',
        name: 'Dụng Cụ Thể Thao',
        slug: 'dung-cu-the-thao',
        parent_id: 'cat-004',
        created_at: '2024-01-14T00:00:00Z',
        updated_at: '2024-01-14T00:00:00Z',
    },
    {
        id: 'cat-015',
        name: 'Quần Áo Thể Thao',
        slug: 'quan-ao-the-thao',
        parent_id: 'cat-004',
        created_at: '2024-01-15T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
    },

    // Subcategories của Sách & Văn Phòng Phẩm (2)
    {
        id: 'cat-016',
        name: 'Sách',
        slug: 'sach',
        parent_id: 'cat-005',
        created_at: '2024-01-16T00:00:00Z',
        updated_at: '2024-01-16T00:00:00Z',
    },
    {
        id: 'cat-017',
        name: 'Văn Phòng Phẩm',
        slug: 'van-phong-pham',
        parent_id: 'cat-005',
        created_at: '2024-01-17T00:00:00Z',
        updated_at: '2024-01-17T00:00:00Z',
    },

    // Sub-subcategories (3)
    {
        id: 'cat-018',
        name: 'Laptop',
        slug: 'laptop',
        parent_id: 'cat-006',
        created_at: '2024-01-18T00:00:00Z',
        updated_at: '2024-01-18T00:00:00Z',
    },
    {
        id: 'cat-019',
        name: 'PC & Linh Kiện',
        slug: 'pc-linh-kien',
        parent_id: 'cat-006',
        created_at: '2024-01-19T00:00:00Z',
        updated_at: '2024-01-19T00:00:00Z',
    },
    {
        id: 'cat-020',
        name: 'Sách Văn Học',
        slug: 'sach-van-hoc',
        parent_id: 'cat-016',
        created_at: '2024-01-20T00:00:00Z',
        updated_at: '2024-01-20T00:00:00Z',
    },
];

/**
 * Function để fetch categories (mock)
 * Có thể thay thế bằng API call thực tế
 */
export const fetchCategories = async (): Promise<Category[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockCategories;
};

/**
 * Function để fetch categories tree (mock)
 */
export const fetchCategoriesTree = async (): Promise<Category[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockCategories;
};

