import React, { useMemo, useState, useCallback } from 'react';
import { Menu, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    DashboardOutlined,
    ShoppingOutlined,
    ShoppingCartOutlined,
    FolderOutlined,
    UserOutlined,
    EyeOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    FileAddOutlined,
    FileSearchOutlined,
} from '@ant-design/icons';
import type { Category } from '../../types';

type MenuItems = NonNullable<MenuProps['items']>;

const STATIC_PATHS = ['/dashboard', '/products', '/orders', '/category', '/profile'] as const;
type StaticPath = (typeof STATIC_PATHS)[number];

interface NavigationMenuProps {
    categories: Category[];
    loading?: boolean;
    onCategoryAction?: (action: 'view' | 'add' | 'update' | 'delete', category: Category) => void;
    onStaticAction?: (action: string, path: string) => void;
}

/**
 * Convert flat categories array to tree structure for Menu items
 */
function buildCategoryTree(categories: Category[]): MenuItems {
    if (!categories || categories.length === 0) return [];

    const categoryMap = new Map<string, Category>();
    const menuItemMap = new Map<string, MenuItems[number]>();
    const rootItems: MenuItems = [];

    // Create map of categories
    categories.forEach(category => {
        categoryMap.set(category.id, category);
        menuItemMap.set(category.id, {
            key: `cat:${category.id}`,
            label: category.name,
            icon: <FolderOutlined />,
        });
    });

    // Build tree structure
    categories.forEach(category => {
        const menuItem = menuItemMap.get(category.id);
        if (!menuItem) return;

        if (category.parent_id) {
            const parentItem = menuItemMap.get(category.parent_id);
            if (parentItem) {
                if (!('children' in parentItem) || !parentItem.children) {
                    (parentItem as MenuItems[number] & { children: MenuItems }).children = [];
                }
                (parentItem as MenuItems[number] & { children: MenuItems }).children.push(menuItem);
            } else {
                rootItems.push(menuItem);
            }
        } else {
            rootItems.push(menuItem);
        }
    });

    // Remove empty children arrays
    const cleanChildren = (item: MenuItems[number]): void => {
        if (!item) return;
        if ('children' in item && item.children) {
            if (item.children.length === 0) {
                delete (item as MenuItems[number] & { children?: MenuItems }).children;
            } else {
                item.children.forEach(cleanChildren);
            }
        }
    };

    rootItems.forEach(cleanChildren);
    return rootItems;
}

/**
 * Build static menu items
 */
function buildStaticMenuItems(): MenuItems {
    return [
        {
            key: '/dashboard',
            label: 'Dashboard',
            icon: <DashboardOutlined />,
        },
        {
            key: '/products',
            label: 'Products',
            icon: <ShoppingOutlined />,
        },
        {
            key: '/orders',
            label: 'Orders',
            icon: <ShoppingCartOutlined />,
        },
        {
            key: '/profile',
            label: 'Profile',
            icon: <UserOutlined />,
        },
    ];
}

/**
 * Get context menu items for static menu items
 */
function getStaticContextMenuItems(
    path: StaticPath,
    onStaticAction?: (action: string, path: string) => void
): MenuItems {
    const actions: MenuItems = [];

    switch (path) {
        case '/dashboard':
            actions.push(
                {
                    key: 'view-dashboard',
                    label: 'View Dashboard',
                    icon: <EyeOutlined />,
                    onClick: () => onStaticAction?.('view', path),
                },
                {
                    key: 'refresh-dashboard',
                    label: 'Refresh',
                    icon: <FileSearchOutlined />,
                    onClick: () => onStaticAction?.('refresh', path),
                }
            );
            break;
        case '/products':
            actions.push(
                {
                    key: 'view-products',
                    label: 'View Products',
                    icon: <EyeOutlined />,
                    onClick: () => onStaticAction?.('view', path),
                },
                {
                    key: 'add-product',
                    label: 'Add Product',
                    icon: <FileAddOutlined />,
                    onClick: () => onStaticAction?.('add', path),
                },
                {
                    key: 'refresh-products',
                    label: 'Refresh',
                    icon: <FileSearchOutlined />,
                    onClick: () => onStaticAction?.('refresh', path),
                }
            );
            break;
        case '/orders':
            actions.push(
                {
                    key: 'view-orders',
                    label: 'View Orders',
                    icon: <EyeOutlined />,
                    onClick: () => onStaticAction?.('view', path),
                },
                {
                    key: 'refresh-orders',
                    label: 'Refresh',
                    icon: <FileSearchOutlined />,
                    onClick: () => onStaticAction?.('refresh', path),
                }
            );
            break;
        case '/category':
            actions.push(
                {
                    key: 'view-category',
                    label: 'View Categories',
                    icon: <EyeOutlined />,
                    onClick: () => onStaticAction?.('view', path),
                },
                {
                    key: 'add-category',
                    label: 'Add Category',
                    icon: <FileAddOutlined />,
                    onClick: () => onStaticAction?.('add', path),
                },
                {
                    key: 'refresh-category',
                    label: 'Refresh',
                    icon: <FileSearchOutlined />,
                    onClick: () => onStaticAction?.('refresh', path),
                }
            );
            break;
        case '/profile':
            actions.push(
                {
                    key: 'view-profile',
                    label: 'View Profile',
                    icon: <EyeOutlined />,
                    onClick: () => onStaticAction?.('view', path),
                },
                {
                    key: 'edit-profile',
                    label: 'Edit Profile',
                    icon: <EditOutlined />,
                    onClick: () => onStaticAction?.('edit', path),
                }
            );
            break;
    }

    return actions;
}

/**
 * Get context menu items for category items (chung cho tất cả submenu)
 * Hiển thị tên category trong context menu
 */
function getCategoryContextMenuItems(
    categoryId: string,
    categories: Category[],
    onCategoryAction?: (action: 'view' | 'add' | 'update' | 'delete', category: Category) => void
): MenuItems {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return [];

    return [
        {
            key: 'category-title',
            label: (
                <div style={{ fontWeight: 'bold', padding: '4px 0', color: 'rgba(0, 0, 0, 0.85)' }}>
                    {category.name}
                </div>
            ),
            disabled: true,
        },
        {
            type: 'divider',
        },
        {
            key: 'view-category',
            label: 'View',
            icon: <EyeOutlined />,
            onClick: () => onCategoryAction?.('view', category),
        },
        {
            key: 'edit-category',
            label: 'Edit',
            icon: <EditOutlined />,
            onClick: () => onCategoryAction?.('update', category),
        },
        {
            type: 'divider',
        },
        {
            key: 'add-category',
            label: 'Add',
            icon: <PlusOutlined />,
            onClick: () => onCategoryAction?.('add', category),
        },
        {
            key: 'delete-category',
            label: 'Delete',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => onCategoryAction?.('delete', category),
        },
    ];
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
    categories,
    loading,
    onCategoryAction,
    onStaticAction,
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Build menu items: static + categories
    const menuItems = useMemo<MenuItems>(() => {
        const staticItems = buildStaticMenuItems();
        const categoryItems = buildCategoryTree(categories);

        // Combine static items with category items
        // Category là static item, các category items sẽ là children của Category
        const allItems: MenuItems = [
            ...staticItems,
            ...(categoryItems.length > 0
                ? [
                    {
                        key: '/category',
                        label: 'Category',
                        icon: <FolderOutlined />,
                        children: categoryItems,
                    },
                ]
                : []),
        ];

        return allItems;
    }, [categories]);

    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [openKeys, setOpenKeys] = useState<string[]>(['/category']);
    const [contextMenuKey, setContextMenuKey] = useState<string | null>(null);

    // Update selected keys based on location
    React.useEffect(() => {
        const currentPath = location.pathname;
        const keys: string[] = [];

        // Check static paths
        if (STATIC_PATHS.includes(currentPath as StaticPath)) {
            keys.push(currentPath);
        }

        // Check category paths
        if (currentPath.startsWith('/categories/')) {
            const slug = currentPath.replace('/categories/', '');
            const category = categories.find(c => c.slug === slug);
            if (category) {
                keys.push(`cat:${category.id}`);
            }
        }

        if (keys.length > 0) {
            setSelectedKeys(keys);
        }
    }, [location.pathname, categories]);

    // Handle context menu to identify clicked menu item
    // Sử dụng clientX và clientY từ MouseEvent để xác định vị trí cursor
    const handleContextMenu = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            // Sử dụng clientX và clientY từ MouseEvent
            const { clientX, clientY } = e;

            // Tìm element tại vị trí cursor
            const elementAtPoint = document.elementFromPoint(clientX, clientY);
            if (!elementAtPoint) {
                e.preventDefault();
                return;
            }

            // Tìm li element gần nhất (menu item hoặc submenu)
            const liElement = elementAtPoint.closest('li.ant-menu-item, li.ant-menu-submenu-title, li.ant-menu-submenu') as HTMLElement;

            if (!liElement) {
                e.preventDefault();
                return;
            }

            // Kiểm tra xem có phải là submenu item không (nằm trong ul.ant-menu-sub)
            const isSubmenuItem = liElement.closest('ul.ant-menu-sub') !== null;

            // Get text content from menu item
            // Lấy text từ span bên trong để tránh lấy text từ parent menu
            const spanElement = liElement.querySelector('span.ant-menu-title, span');
            const textContent = spanElement?.textContent?.trim() || liElement.textContent?.trim();

            if (!textContent) {
                e.preventDefault();
                return;
            }

            // Clean text: loại bỏ các ký tự đặc biệt và normalize
            const cleanText = textContent.replace(/\s+/g, ' ').trim();
            const normalizedText = cleanText.toLowerCase();

            // Nếu là submenu item, ưu tiên tìm category trước
            if (isSubmenuItem) {
                // First, try to find category by name directly (priority for submenu)
                const categoryMap = new Map(categories.map(c => [c.name.toLowerCase().trim(), c]));

                // Try exact match first
                let category = categoryMap.get(normalizedText);

                // If not found, try partial match
                if (!category) {
                    category = Array.from(categoryMap.values()).find(c => {
                        const categoryName = c.name.toLowerCase().trim();
                        return normalizedText === categoryName ||
                            normalizedText.includes(categoryName) ||
                            categoryName.includes(normalizedText);
                    });
                }

                if (category) {
                    // Found category, use category key
                    setContextMenuKey(`cat:${category.id}`);
                    return;
                }
            }

            // If not a category or not in submenu, try to find in static menu items
            // Only check top-level static items, not submenu items
            const staticMenuMap = new Map<string, string>();
            menuItems.forEach(item => {
                if (!item) return;
                if ('type' in item && item.type === 'divider') return;

                if ('label' in item) {
                    let labelText = '';
                    if (typeof item.label === 'string') {
                        labelText = item.label;
                    } else if (React.isValidElement(item.label)) {
                        // Extract text from React element
                        const extractText = (node: React.ReactNode): string => {
                            if (typeof node === 'string') return node;
                            if (typeof node === 'number') return String(node);
                            if (React.isValidElement(node)) {
                                const props = node.props as { children?: React.ReactNode };
                                if (props?.children) {
                                    return extractText(props.children);
                                }
                            }
                            return '';
                        };
                        labelText = extractText(item.label);
                    } else {
                        labelText = String(item.label || '');
                    }

                    const normalizedLabel = labelText.trim().toLowerCase();
                    if (normalizedLabel) {
                        staticMenuMap.set(normalizedLabel, String(item.key));
                    }
                }
            });

            // Try exact match first
            const staticKey = staticMenuMap.get(normalizedText);
            if (staticKey) {
                setContextMenuKey(staticKey);
                return;
            }

            // Try partial match
            for (const [label, key] of staticMenuMap.entries()) {
                if (normalizedText === label || normalizedText.includes(label) || label.includes(normalizedText)) {
                    setContextMenuKey(key);
                    return;
                }
            }

            // If still not found and in submenu, try category again
            if (isSubmenuItem) {
                const categoryMap = new Map(categories.map(c => [c.name.toLowerCase().trim(), c]));
                const category = Array.from(categoryMap.values()).find(c => {
                    const categoryName = c.name.toLowerCase().trim();
                    return normalizedText === categoryName ||
                        normalizedText.includes(categoryName) ||
                        categoryName.includes(normalizedText);
                });

                if (category) {
                    setContextMenuKey(`cat:${category.id}`);
                    return;
                }
            }

            // Debug: log để kiểm tra
            console.warn('Could not find menu key for:', {
                textContent: cleanText,
                normalizedText,
                isSubmenuItem,
                clientX,
                clientY,
                availableCategories: categories.map(c => c.name),
                availableStaticMenus: Array.from(staticMenuMap.keys())
            });
            e.preventDefault();
        },
        [menuItems, categories]
    );

    // Get context menu items based on clicked menu key
    const getContextMenuItems = useCallback((): MenuItems => {
        if (!contextMenuKey) return [];

        // Check if it's a static path
        if (STATIC_PATHS.includes(contextMenuKey as StaticPath)) {
            return getStaticContextMenuItems(contextMenuKey as StaticPath, onStaticAction);
        }

        // Check if it's a category (format: cat:categoryId)
        if (contextMenuKey.startsWith('cat:')) {
            const categoryId = contextMenuKey.replace('cat:', '');
            return getCategoryContextMenuItems(categoryId, categories, onCategoryAction);
        }

        return [];
    }, [contextMenuKey, categories, onCategoryAction, onStaticAction]);

    // Handle menu click
    const handleMenuClick = useCallback(
        ({ key }: { key: string }) => {
            setSelectedKeys([String(key)]);

            // Navigate for static paths
            if (STATIC_PATHS.includes(key as StaticPath)) {
                navigate(key);
                return;
            }

            // Navigate for category keys
            if (key.startsWith('cat:')) {
                const categoryId = key.replace('cat:', '');
                const category = categories.find(c => c.id === categoryId);
                if (category) {
                    navigate(`/categories/${category.slug}`);
                }
            }
        },
        [navigate, categories]
    );

    if (loading) {
        return (
            <div style={{ padding: '16px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.65)' }}>
                Loading menu...
            </div>
        );
    }

    return (
        <Dropdown
            menu={{
                items: getContextMenuItems(),
            }}
            trigger={['contextMenu']}

            onOpenChange={(open) => {
                // Reset contextMenuKey khi dropdown đóng
                if (!open) {
                    setContextMenuKey(null);
                }
            }}
        >
            <div onContextMenu={handleContextMenu}>
                <Menu
                    theme="dark"
                    mode="inline"
                    items={menuItems}
                    selectedKeys={selectedKeys}
                    openKeys={openKeys}
                    onOpenChange={(keys) => setOpenKeys(keys as string[])}
                    onClick={handleMenuClick}
                    style={{ border: 'none', width: '100%' }}
                />
            </div>
        </Dropdown>
    );
};

