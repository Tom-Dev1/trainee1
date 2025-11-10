import React from 'react';
import { Card, Typography, Tag, Descriptions, Button, Space, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { productsApi } from '../../services/api';
import { SafeImage } from '../../components/SafeImage';

const { Title, Paragraph } = Typography;

export const ProductDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const { data: product, isLoading, error } = useQuery({
        queryKey: ['product', slug],
        queryFn: () => productsApi.getProduct(slug!),
        enabled: !!slug,
    });

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div style={{ textAlign: 'center', padding: 50 }}>
                <Title level={3}>Product not found</Title>
                <Button type="primary" onClick={() => navigate('/products')}>
                    Back to Products
                </Button>
            </div>
        );
    }

    return (
        <div>
            <Space style={{ marginBottom: 24 }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/products')}
                >
                    Back to Products
                </Button>
                <Button type="primary" icon={<EditOutlined />}>
                    Edit Product
                </Button>
            </Space>

            <Card>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <div style={{ flex: '0 0 300px' }}>
                        {(() => {
                            const images = Array.isArray(product.imageUrl) ? product.imageUrl : [product.imageUrl];
                            const firstImage = images[0];
                            return firstImage ? (
                                <SafeImage
                                    width="100%"
                                    height={300}
                                    src={firstImage}
                                    style={{ objectFit: 'cover', borderRadius: 8 }}
                                    preview={images.length > 1 ? {
                                        mask: `+${images.length - 1}`,
                                    } : true}
                                />
                            ) : null;
                        })()}
                    </div>

                    <div style={{ flex: 1, minWidth: 300 }}>
                        <Title level={2}>{product.name}</Title>

                        <Space style={{ marginBottom: 16 }}>
                            <Tag color={product.status === 'active' ? 'green' : 'red'}>
                                {product.status.toUpperCase()}
                            </Tag>
                            <Tag>${product.price.toFixed(2)}</Tag>
                            <Tag>{product.stock} in stock</Tag>
                        </Space>

                        <Paragraph>{product.description}</Paragraph>

                        <Descriptions column={1} bordered>
                            <Descriptions.Item label="Product ID">{product.id}</Descriptions.Item>
                            <Descriptions.Item label="Slug">{product.slug}</Descriptions.Item>
                            <Descriptions.Item label="Category ID">{product.categoryId}</Descriptions.Item>
                            <Descriptions.Item label="Price">${product.price.toFixed(2)}</Descriptions.Item>
                            <Descriptions.Item label="Stock">{product.stock}</Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Tag color={product.status === 'active' ? 'green' : 'red'}>
                                    {product.status.toUpperCase()}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Created">
                                {new Date(product.createdAt).toLocaleDateString()}
                            </Descriptions.Item>
                            <Descriptions.Item label="Last Updated">
                                {new Date(product.updatedAt).toLocaleDateString()}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                </div>
            </Card>
        </div>
    );
};