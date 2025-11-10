import type { Product, Category, CategoryFormData } from '../types';
import { generateUniqueSlug } from '../utils/slug';

const PRODUCTS_KEY = 'ecommerce_products';
const CATEGORIES_KEY = 'ecommerce_categories';

// Products LocalStorage service
export const productsStorage = {
    getProducts: (): Product[] => {
        const stored = localStorage.getItem(PRODUCTS_KEY);
        return stored ? JSON.parse(stored) : [];
    },

    setProducts: (products: Product[]): void => {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    },

    addProduct: (product: Omit<Product, 'id' | 'slug' | 'createdAt' | 'updatedAt'>): Product => {
        const products = productsStorage.getProducts();
        const newProduct: Product = {
            ...product,
            id: Date.now().toString(),
            slug: generateUniqueSlug(product.name, products),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        products.push(newProduct);
        productsStorage.setProducts(products);
        return newProduct;
    },

    updateProduct: (id: string, updates: Partial<Product>): Product | null => {
        const products = productsStorage.getProducts();
        const index = products.findIndex(p => p.id === id);

        if (index === -1) return null;

        const updatedProduct = {
            ...products[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        // Update slug if name changed
        if (updates.name && updates.name !== products[index].name) {
            updatedProduct.slug = generateUniqueSlug(updates.name, products, id);
        }

        products[index] = updatedProduct;
        productsStorage.setProducts(products);
        return updatedProduct;
    },

    deleteProduct: (id: string): boolean => {
        const products = productsStorage.getProducts();
        const filteredProducts = products.filter(p => p.id !== id);

        if (filteredProducts.length === products.length) return false;

        productsStorage.setProducts(filteredProducts);
        return true;
    },
};

// Categories LocalStorage service
export const categoriesStorage = {
    // Get flat list of categories
    getCategories: (): Category[] => {
        const stored = localStorage.getItem(CATEGORIES_KEY);
        return stored ? JSON.parse(stored) : [];
    },

    setCategories: (categories: Category[]): void => {
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    },

    // Sync initial data from API
    syncFromApi: (apiCategories: Category[]): void => {
        const flatCategories = flattenCategories(apiCategories);
        categoriesStorage.setCategories(flatCategories);
    },

    addCategory: (categoryData: CategoryFormData): Category => {
        const categories = categoriesStorage.getCategories();

        const newCategory: Category = {
            id: Date.now().toString(),
            name: categoryData.name,
            slug: generateUniqueSlug(categoryData.name, categories),
            parent_id: categoryData.parent_id || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        categories.push(newCategory);
        categoriesStorage.setCategories(categories);
        return newCategory;
    },

    updateCategory: (id: string, updates: Partial<CategoryFormData>): Category | null => {
        const categories = categoriesStorage.getCategories();
        const index = categories.findIndex(c => c.id === id);

        if (index === -1) return null;

        const updatedCategory: Category = {
            ...categories[index],
            ...updates,
            updated_at: new Date().toISOString(),
        };

        // Update slug if name changed
        if (updates.name && updates.name !== categories[index].name) {
            updatedCategory.slug = generateUniqueSlug(updates.name, categories, id);
        }

        categories[index] = updatedCategory;
        categoriesStorage.setCategories(categories);
        return updatedCategory;
    },

    deleteCategory: (id: string): boolean => {
        const categories = categoriesStorage.getCategories();

        // Check if category has children
        const hasChildren = categories.some(c => c.parent_id === id);
        if (hasChildren) {
            throw new Error('Cannot delete category with children');
        }

        const filteredCategories = categories.filter(c => c.id !== id);

        if (filteredCategories.length === categories.length) return false;

        categoriesStorage.setCategories(filteredCategories);
        return true;
    },

    // Build tree structure from flat list
    buildTree: (): Category[] => {
        const categories = categoriesStorage.getCategories();
        return buildCategoryTree(categories);
    },
};

// Helper functions
const flattenCategories = (categories: Category[]): Category[] => {
    const result: Category[] = [];

    const flatten = (cats: Category[]) => {
        cats.forEach(cat => {
            const { children, ...flatCat } = cat as any;
            result.push(flatCat);
            if (children) {
                flatten(children);
            }
        });
    };

    flatten(categories);
    return result;
};

const buildCategoryTree = (categories: Category[]): any[] => {
    const categoryMap = new Map<string, any>();
    const rootCategories: any[] = [];

    // Create a map of all categories
    categories.forEach(cat => {
        categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Build the tree
    categories.forEach(cat => {
        const category = categoryMap.get(cat.id)!;
        if (cat.parent_id) {
            const parent = categoryMap.get(cat.parent_id);
            if (parent) {
                parent.children = parent.children || [];
                parent.children.push(category);
            }
        } else {
            rootCategories.push(category);
        }
    });

    return rootCategories;
};