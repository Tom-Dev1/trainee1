import React, { useState } from 'react';
import { Button, Typography, Card, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Category, ContextMenuAction } from '../../types';
import { useCategories, useDeleteCategory } from '../../hooks/useCategories';
import { CategoryForm } from '../../components/CategoryForm';
import { ContextMenu } from '../../components/ContextMenu';
import { CategorySubmenu } from '../../components/CategorySubmenu';

const { Title } = Typography;

export const CategoryList: React.FC = () => {
    const navigate = useNavigate();
    const [contextMenuVisible, setContextMenuVisible] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const { data: categories, isLoading } = useCategories();
    const deleteMutation = useDeleteCategory();



    const handleContextMenu = (e: React.MouseEvent & { action?: string }, category: Category) => {
        e.preventDefault();
        setSelectedCategory(category);

        // If action is provided, handle it directly
        const eventAction = (e as React.MouseEvent & { action?: string }).action;
        if (eventAction) {
            const action = eventAction;
            switch (action) {
                case 'add':
                    navigate(`/category?action=add&parentId=${category.id}`);
                    break;
                case 'edit':
                    navigate(`/category?action=edit&categoryId=${category.id}`);
                    break;
                case 'view':
                    navigate(`/category?action=view&categoryId=${category.id}`);
                    break;
                case 'delete':
                    handleDelete(category);
                    break;
            }
        } else {
            // Regular context menu
            setContextMenuPosition({ x: e.clientX, y: e.clientY });
            setContextMenuVisible(true);
        }
    };

    const contextMenuActions: ContextMenuAction[] = [
        {
            key: 'view',
            label: 'View',
            icon: <EyeOutlined />,
        },
        {
            key: 'add',
            label: 'Add Subcategory',
            icon: <PlusOutlined />,
        },
        {
            key: 'edit',
            label: 'Edit',
            icon: <EditOutlined />,
        },
        {
            key: 'delete',
            label: 'Delete',
            icon: <DeleteOutlined />,
            danger: true,
        },
    ];

    const handleContextMenuAction = (key: string) => {
        if (!selectedCategory) return;

        switch (key) {
            case 'view':
                // Navigate directly to category detail page
                navigate(`/categories/${selectedCategory.slug}`);
                break;
            case 'add':
                navigate(`/category?action=add&parentId=${selectedCategory.id}`);
                break;
            case 'edit':
                navigate(`/category?action=edit&categoryId=${selectedCategory.id}`);
                break;
            case 'delete':
                handleDelete(selectedCategory);
                break;
        }
        setContextMenuVisible(false);
    };

    const handleAdd = () => {
        navigate('/category?action=add');
    };

    const handleDelete = (category: Category) => {
        Modal.confirm({
            title: 'Delete Category',
            content: `Are you sure you want to delete "${category.name}"?`,
            onOk: () => {
                deleteMutation.mutate(category.id);
            },
        });
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={2}>Categories</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Add Category
                </Button>
            </div>

            <Card>
                <CategorySubmenu
                    categories={categories || []}
                    loading={isLoading}
                    onContextMenu={handleContextMenu}
                />
            </Card>

            {/* CategoryForm handles URL params and localStorage automatically */}
            <CategoryForm categories={categories || []} />

            <ContextMenu
                visible={contextMenuVisible}
                position={contextMenuPosition}
                actions={contextMenuActions}
                onAction={handleContextMenuAction}
                onClose={() => setContextMenuVisible(false)}
            />
        </div>
    );
};