import React, { useState, useMemo } from 'react';
import { Menu, Dropdown } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { MoreOutlined, EyeOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

import type { Category, ContextMenuAction } from '../../types';
import { ContextMenu } from '../ContextMenu';

const { SubMenu, Item } = Menu;

interface CategorySubmenuProps {
    categories: Category[];
    loading?: boolean;
    onContextMenu?: (e: React.MouseEvent, category: Category) => void;
}

interface CategoryMenuItem {
    category: Category;
    children: CategoryMenuItem[];
}

export const CategorySubmenu: React.FC<CategorySubmenuProps> = ({
    categories,
    loading,
    onContextMenu
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [contextMenuVisible, setContextMenuVisible] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    // Build category hierarchy from flat structure
    const categoryHierarchy = useMemo(() => {
        if (!categories || categories.length === 0) return [];

        const categoryMap = new Map<string, CategoryMenuItem>();
        const rootCategories: CategoryMenuItem[] = [];

        // First pass: create all category items
        categories.forEach(category => {
            categoryMap.set(category.id, {
                category,
                children: []
            });
        });

        // Second pass: build hierarchy
        categories.forEach(category => {
            const categoryItem = categoryMap.get(category.id)!;

            if (category.parent_id) {
                const parent = categoryMap.get(category.parent_id);
                if (parent) {
                    parent.children.push(categoryItem);
                }
            } else {
                rootCategories.push(categoryItem);
            }
        });

        return rootCategories;
    }, [categories]);

    const handleContextMenu = (e: React.MouseEvent, category: Category) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedCategory(category);
        setContextMenuPosition({ x: e.clientX, y: e.clientY });
        setContextMenuVisible(true);
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
        if (selectedCategory) {
            // Handle actions directly or pass to parent
            switch (key) {
                case 'view':
                    navigate(`/categories/${selectedCategory.slug}`);
                    break;
                case 'add':
                case 'edit':
                case 'delete':
                    // Pass these actions to parent component if handler exists
                    if (onContextMenu) {
                        const syntheticEvent = {
                            preventDefault: () => { },
                            stopPropagation: () => { },
                            clientX: contextMenuPosition.x,
                            clientY: contextMenuPosition.y,
                            action: key,
                        } as any;
                        onContextMenu(syntheticEvent, selectedCategory);
                    }
                    break;
            }
        }
        setContextMenuVisible(false);
    };

    const handleMenuClick = (category: Category) => {
        navigate(`/categories/${category.slug}`);
    };

    const renderCategoryItem = (categoryItem: CategoryMenuItem): React.ReactNode => {
        const { category, children } = categoryItem;
        const isActive = location.pathname === `/categories/${category.slug}`;

        const categoryTitle = (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    color: isActive ? '#1890ff' : 'rgba(255, 255, 255, 0.85)',
                    fontWeight: isActive ? 'bold' : 'normal',
                }}
                onContextMenu={(e) => onContextMenu ? onContextMenu(e, category) : handleContextMenu(e, category)}
                onClick={(e) => {
                    e.stopPropagation();
                    handleMenuClick(category);
                }}
            >
                <span style={{ cursor: 'pointer' }}>
                    {category.name}
                </span>
                <Dropdown
                    menu={{
                        items: contextMenuActions.map(action => ({
                            key: action.key,
                            label: action.label,
                            icon: action.icon,
                            danger: action.danger,
                        })),
                        onClick: ({ key }) => {
                            setSelectedCategory(category);
                            handleContextMenuAction(key);
                        }
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <MoreOutlined
                        style={{
                            opacity: 0.6,
                            color: 'rgba(255, 255, 255, 0.65)',
                            padding: '4px',
                            cursor: 'pointer'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </Dropdown>
            </div>
        );

        if (children.length > 0) {
            return (
                <SubMenu
                    key={category.id}
                    title={categoryTitle}
                    style={{ color: 'rgba(255, 255, 255, 0.85)' }}
                >
                    {children.map(child => renderCategoryItem(child))}
                </SubMenu>
            );
        } else {
            return (
                <Item
                    key={category.id}
                    style={{
                        color: isActive ? '#1890ff' : 'rgba(255, 255, 255, 0.85)',
                        fontWeight: isActive ? 'bold' : 'normal',
                    }}
                >
                    {categoryTitle}
                </Item>
            );
        }
    };

    if (loading) {
        return (
            <div style={{
                padding: '8px 16px',
                color: 'rgba(255, 255, 255, 0.65)',
                fontSize: '12px'
            }}>
                Loading categories...
            </div>
        );
    }

    if (!categories || categories.length === 0) {
        return (
            <div style={{
                padding: '8px 16px',
                color: 'rgba(255, 255, 255, 0.65)',
                fontSize: '12px'
            }}>
                No categories found
            </div>
        );
    }

    return (
        <>
            <Menu
                mode="inline"
                theme="dark"
                style={{
                    border: 'none',
                    background: 'transparent'
                }}
                selectedKeys={[]}
                openKeys={categoryHierarchy.map(item => item.category.id)}
            >
                {categoryHierarchy.map(categoryItem => renderCategoryItem(categoryItem))}
            </Menu>

            <ContextMenu
                visible={contextMenuVisible}
                position={contextMenuPosition}
                actions={contextMenuActions}
                onAction={handleContextMenuAction}
                onClose={() => setContextMenuVisible(false)}
            />
        </>
    );
};