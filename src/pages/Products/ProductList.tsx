import React, { useState } from 'react';
import {
    Table,
    Button,
    Input,
    Space,
    Typography,
    Tag,
    Modal,
    message,
    Select,
} from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types';
import { productsApi, categoriesApi } from '../../services/api';
import { productsStorage } from '../../services/localStorage';
import { ProductForm } from '../../components/ProductForm';
import { useProducts } from '../../hooks/useProducts';
import { SafeImage } from '../../components/SafeImage';

const { Title } = Typography;

export const ProductList: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    const { data: productsData, isLoading } = useQuery({
        queryKey: ['products', pagination.current, pagination.pageSize, searchText, selectedCategory],
        queryFn: () =>
            productsApi.getProducts({
                page: pagination.current,
                pageSize: pagination.pageSize,
                search: searchText,
                categoryId: selectedCategory || undefined,
            }),
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: categoriesApi.getCategories,
    });

    // Get all products for ProductForm (without pagination)
    const { data: allProductsData } = useProducts();
    const allProducts = allProductsData?.data || [];

    const handleSearch = (value: string) => {
        setSearchText(value);
        setPagination({ ...pagination, current: 1 });
    };

    const handleCategoryFilter = (value: string) => {
        setSelectedCategory(value);
        setPagination({ ...pagination, current: 1 });
    };

    const handleTableChange = (paginationConfig: { current?: number; pageSize?: number }) => {
        setPagination({
            current: paginationConfig.current || 1,
            pageSize: paginationConfig.pageSize || 10,
        });
    };

    const handleAdd = () => {
        navigate('/products?action=add');
    };

    const handleEdit = (product: Product) => {
        navigate(`/products?action=edit&productId=${product.id}`);
    };

    const handleDelete = (product: Product) => {
        Modal.confirm({
            title: 'Delete Product',
            content: `Are you sure you want to delete "${product.name}"?`,
            onOk: () => {
                const success = productsStorage.deleteProduct(product.id);
                if (success) {
                    message.success('Product deleted successfully');
                    queryClient.invalidateQueries({ queryKey: ['products'] });
                } else {
                    message.error('Failed to delete product');
                }
            },
        });
    };

    const columns = [
        {
            title: 'Image',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            width: 80,
            render: (imageUrl: string | string[]) => {
                const images = Array.isArray(imageUrl) ? imageUrl : [imageUrl];
                const firstImage = images[0];
                if (!firstImage) return null;
                return (
                    <SafeImage
                        width={50}
                        height={50}
                        src={firstImage}
                        style={{ objectFit: 'cover', borderRadius: 4 }}
                        preview={images.length > 1 ? {
                            mask: `+${images.length - 1}`,
                        } : true}
                    />
                );
            },
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (name: string, record: Product) => (
                <Button
                    type="link"
                    onClick={() => navigate(`/products/${record.slug}`)}
                    style={{ padding: 0, height: 'auto' }}
                >
                    {name}
                </Button>
            ),
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => `$${price.toFixed(2)}`,
            sorter: (a: Product, b: Product) => a.price - b.price,
        },
        {
            title: 'Stock',
            dataIndex: 'stock',
            key: 'stock',
            sorter: (a: Product, b: Product) => a.stock - b.stock,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {status.toUpperCase()}
                </Tag>
            ),
            filters: [
                { text: 'Active', value: 'active' },
                { text: 'Inactive', value: 'inactive' },
            ],
            onFilter: (value: boolean | React.Key, record: Product) => record.status === value,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: Product) => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={2}>Products</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Add Product
                </Button>
            </div>

            <Space style={{ marginBottom: 16 }}>
                <Input.Search
                    placeholder="Search products..."
                    allowClear
                    onSearch={handleSearch}
                    style={{ width: 300 }}
                    prefix={<SearchOutlined />}
                />
                <Select
                    placeholder="Filter by category"
                    allowClear
                    style={{ width: 200 }}
                    onChange={handleCategoryFilter}
                    options={categories?.map(category => ({
                        label: category.name,
                        value: category.id,
                    }))}
                />
            </Space>

            <Table
                columns={columns}
                dataSource={productsData?.data || []}
                rowKey="id"
                loading={isLoading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: productsData?.total || 0,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                }}
                onChange={handleTableChange}
            />

            {/* ProductForm handles URL params and localStorage automatically */}
            <ProductForm products={allProducts} />
        </div>
    );
};