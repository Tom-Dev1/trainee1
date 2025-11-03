import React, { useState } from 'react';
import {
    Table,
    Button,
    Input,
    Space,
    Typography,
    Tag,
    Image,
    Modal,
    Form,
    InputNumber,
    Select,
    message,
} from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types';
import { productsApi, categoriesApi } from '../../services/api';
import { productsStorage } from '../../services/localStorage';

const { Title } = Typography;
const { Option } = Select;

export const ProductList: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [form] = Form.useForm();

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

    const handleSearch = (value: string) => {
        setSearchText(value);
        setPagination({ ...pagination, current: 1 });
    };

    const handleCategoryFilter = (value: string) => {
        setSelectedCategory(value);
        setPagination({ ...pagination, current: 1 });
    };

    const handleTableChange = (paginationConfig: any) => {
        setPagination({
            current: paginationConfig.current,
            pageSize: paginationConfig.pageSize,
        });
    };

    const handleAdd = () => {
        setEditingProduct(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        form.setFieldsValue(product);
        setIsModalVisible(true);
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

    const handleSubmit = async (values: any) => {
        try {
            if (editingProduct) {
                const updated = productsStorage.updateProduct(editingProduct.id, values);
                if (updated) {
                    message.success('Product updated successfully');
                } else {
                    message.error('Failed to update product');
                }
            } else {
                productsStorage.addProduct(values);
                message.success('Product created successfully');
            }

            setIsModalVisible(false);
            queryClient.invalidateQueries({ queryKey: ['products'] });
        } catch (error) {
            message.error('An error occurred');
        }
    };

    const columns = [
        {
            title: 'Image',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            width: 80,
            render: (imageUrl: string) => (
                <Image
                    width={50}
                    height={50}
                    src={imageUrl}
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                />
            ),
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
            onFilter: (value: any, record: Product) => record.status === value,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Product) => (
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
                >
                    {categories?.map(category => (
                        <Option key={category.id} value={category.id}>
                            {category.name}
                        </Option>
                    ))}
                </Select>
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

            <Modal
                title={editingProduct ? 'Edit Product' : 'Add Product'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Product Name"
                        rules={[{ required: true, message: 'Please enter product name' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <Form.Item
                        name="price"
                        label="Price"
                        rules={[{ required: true, message: 'Please enter price' }]}
                    >
                        <InputNumber
                            min={0}
                            step={0.01}
                            style={{ width: '100%' }}
                            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value!.replace(/\$\s?|(,*)/g, '') as any}
                        />
                    </Form.Item>

                    <Form.Item
                        name="categoryId"
                        label="Category"
                        rules={[{ required: true, message: 'Please select category' }]}
                    >
                        <Select>
                            {categories?.map(category => (
                                <Option key={category.id} value={category.id}>
                                    {category.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="stock"
                        label="Stock"
                        rules={[{ required: true, message: 'Please enter stock quantity' }]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="imageUrl"
                        label="Image URL"
                        rules={[{ required: true, message: 'Please enter image URL' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Status"
                        rules={[{ required: true, message: 'Please select status' }]}
                    >
                        <Select>
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingProduct ? 'Update' : 'Create'}
                            </Button>
                            <Button onClick={() => setIsModalVisible(false)}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};