import React from 'react';
import { Card, Typography, Button, Space, Spin, Descriptions, Tree, Breadcrumb } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, EditOutlined, HomeOutlined } from '@ant-design/icons';
import type { Category } from '../../types';
import { useCategory, useCategories } from '../../hooks/useCategories';

const { Title } = Typography;

interface TreeNode {
    title: string;
    key: string;
    children?: TreeNode[];
}

interface CategoryWithChildren extends Category {
    children?: CategoryWithChildren[];
}

export const CategoryDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const { data: category, isLoading, error } = useCategory(slug!);
    const { data: allCategories } = useCategories();

    // Build breadcrumb from root to current category
    const buildBreadcrumb = () => {
        if (!category || !allCategories) return [];

        const flatCategories = allCategories.flatMap(function flatten(cat: Category | CategoryWithChildren): Category[] {
            const categoryWithChildren = cat as CategoryWithChildren;
            const { children, ...flatCat } = categoryWithChildren;
            return [flatCat, ...(children ? children.flatMap(flatten) : [])];
        });

        const buildPath = (cat: Category): Category[] => {
            const path = [cat];
            if (cat.parent_id) {
                const parent = flatCategories.find(c => c.id === cat.parent_id);
                if (parent) {
                    path.unshift(...buildPath(parent));
                }
            }
            return path;
        };

        return buildPath(category);
    };

    const breadcrumbPath = buildBreadcrumb();

    const buildTreeData = (categories: CategoryWithChildren[]): TreeNode[] => {
        return categories.map(cat => ({
            title: cat.name,
            key: cat.id,
            children: cat.children ? buildTreeData(cat.children) : undefined,
        }));
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error || !category) {
        return (
            <div style={{ textAlign: 'center', padding: 50 }}>
                <Title level={3}>Category not found</Title>
                <Button type="primary" onClick={() => navigate('/categories')}>
                    Back to Categories
                </Button>
            </div>
        );
    }

    return (
        <div>
            <Space direction="vertical" style={{ width: '100%', marginBottom: 24 }}>
                <Space>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/categories')}
                    >
                        Back to Categories
                    </Button>
                    <Button type="primary" icon={<EditOutlined />}>
                        Edit Category
                    </Button>
                </Space>

                <Breadcrumb
                    items={[
                        {
                            href: '/categories',
                            title: <HomeOutlined />,
                        },
                        ...breadcrumbPath.map(cat => ({
                            title: cat.name,
                            href: `/categories/${cat.slug}`,
                        })),
                    ]}
                />
            </Space>

            <Card title={<Title level={2}>{category.name}</Title>}>
                <Descriptions column={1} bordered style={{ marginBottom: 24 }}>
                    <Descriptions.Item label="Category ID">{category.id}</Descriptions.Item>
                    <Descriptions.Item label="Slug">{category.slug}</Descriptions.Item>
                    <Descriptions.Item label="Parent ID">{category.parent_id || 'None (Root Category)'}</Descriptions.Item>
                    <Descriptions.Item label="Created">
                        {new Date(category.created_at).toLocaleDateString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Updated">
                        {new Date(category.updated_at).toLocaleDateString()}
                    </Descriptions.Item>
                </Descriptions>

                {(() => {
                    const categoryWithChildren = category as CategoryWithChildren;
                    return categoryWithChildren.children && categoryWithChildren.children.length > 0 ? (
                        <div>
                            <Title level={4}>Subcategories</Title>
                            <Tree
                                treeData={buildTreeData(categoryWithChildren.children)}
                                defaultExpandAll
                                showLine
                            />
                        </div>
                    ) : null;
                })()}
            </Card>
        </div>
    );
};