import type { Category, MenuItemType } from '../types';

/**
 * Convert flat Category array to hierarchical MenuItemType array
 */
export const convertCategoriesToMenuItems = (categories: Category[]): MenuItemType[] => {
    if (!categories || categories.length === 0) return [];

    const categoryMap = new Map<string, Category>();
    const menuItemMap = new Map<string, MenuItemType>();
    const rootItems: MenuItemType[] = [];

    // First pass: create all menu items
    categories.forEach(category => {
        categoryMap.set(category.id, category);
        menuItemMap.set(category.id, {
            key: `category-${category.id}`,
            label: category.name,
            category,
        });
    });

    // Second pass: build hierarchy
    categories.forEach(category => {
        const menuItem = menuItemMap.get(category.id)!;

        if (category.parent_id) {
            const parentItem = menuItemMap.get(category.parent_id);
            if (parentItem) {
                if (!parentItem.children) {
                    parentItem.children = [];
                }
                parentItem.children.push(menuItem);
            }
        } else {
            rootItems.push(menuItem);
        }
    });

    return rootItems;
};

