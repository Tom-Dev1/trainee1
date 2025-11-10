import React, { useState, useMemo, useCallback } from 'react';
import { Tree, Dropdown, Button } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { MoreOutlined, EyeOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { Category, CategoryTreeNode } from '../../types';
import { CategoryContextMenu } from './CategoryContextMenu';
import { CategoryModals } from './CategoryModals';

interface CategoryTreeProps {
    categories: Category[];
    loading?: boolean;
    onContextMenu?: (e: React.MouseEvent, category: Category) => void;
}

export const CategoryTree: React.FC<CategoryTreeProps> = ({ categories, loading, onContextMenu }) => {
    const navigate = useNavigate();
    const { slug } = useParams();
    const [contextMenuVisible, setContextMenuVisible] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [modalType, setModalType] = useState<'add' | 'edit' | 'delete' | null>(null);

    const handleContextMenu = useCallback((e: React.MouseEvent, category: Category) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedCategory(category);
        setContextMenuPosition({ x: e.clientX, y: e.clientY });
        setContextMenuVisible(true);
    }, []);

    const getMenuItems = useCallback((): MenuProps['items'] => [
        {
            key: 'view',
            label: 'View',
            icon: <EyeOutlined />,
        },
        {
            key: 'add-subcategory',
            label: 'Add Subcategory',
            icon: <PlusOutlined />,
        },
        {
            key: 'edit',
            label: 'Edit',
            icon: <EditOutlined />,
        },
        {
            type: 'divider',
        },
        {
            key: 'delete',
            label: 'Delete',
            icon: <DeleteOutlined />,
            danger: true,
        },
    ], []);

    const handleMenuClick = useCallback((key: string, cat: Category) => {
        setSelectedCategory(cat);

        switch (key) {
            case 'view':
                navigate(`/categories/${cat.slug}`);
                break;
            case 'add-subcategory':
                setModalType('add');
                break;
            case 'edit':
                setModalType('edit');
                break;
            case 'delete':
                setModalType('delete');
                break;
        }
    }, [navigate]);

    // Build tree data structure
    const treeData = useMemo(() => {
        const buildTreeNodes = (cats: Category[]): CategoryTreeNode[] => {
            return cats.map(category => ({
                key: category.id,
                title: (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%'
                        }}
                        onContextMenu={(e) => onContextMenu ? onContextMenu(e, category) : handleContextMenu(e, category)}
                    >
                        <span
                            style={{
                                cursor: 'pointer',
                                fontWeight: category.slug === slug ? 'bold' : 'normal',
                                color: category.slug === slug ? '#1890ff' : 'inherit'
                            }}
                            onClick={() => navigate(`/categories/${category.slug}`)}
                        >
                            {category.name}
                        </span>
                        <Dropdown
                            menu={{
                                items: getMenuItems(),
                                onClick: ({ key }) => handleMenuClick(key, category)
                            }}
                            trigger={['click']}
                            placement="bottomRight"
                        >
                            <Button
                                type="text"
                                size="small"
                                icon={<MoreOutlined />}
                                onClick={(e) => e.stopPropagation()}
                                style={{ opacity: 0.6 }}
                            />
                        </Dropdown>
                    </div>
                ),
                category,
                children: (category as any).children ? buildTreeNodes((category as any).children) : undefined,
            }));
        };

        return buildTreeNodes(categories);
    }, [categories, slug, navigate, handleContextMenu, getMenuItems, handleMenuClick]);

    const handleContextMenuAction = (action: string) => {
        if (selectedCategory) {
            handleMenuClick(action, selectedCategory);
        }
        setContextMenuVisible(false);
    };

    const closeModal = () => {
        setModalType(null);
        setSelectedCategory(null);
    };

    return (
        <>
            {loading ? (
                <div>Loading categories...</div>
            ) : (
                <Tree
                    treeData={treeData}
                    defaultExpandAll
                    showLine
                    blockNode
                    selectedKeys={slug ? [categories.find(c => c.slug === slug)?.id || ''] : []}
                />
            )}

            <CategoryContextMenu
                visible={contextMenuVisible}
                position={contextMenuPosition}
                onAction={handleContextMenuAction}
                onClose={() => setContextMenuVisible(false)}
            />

            <CategoryModals
                type={modalType}
                category={selectedCategory}
                onClose={closeModal}
            />
        </>
    );
};