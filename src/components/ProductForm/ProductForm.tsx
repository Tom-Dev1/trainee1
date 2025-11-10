import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DynamicForm } from '../DynamicForm';
import type { Product, DynamicFormField } from '../../types';
import { useCreateProduct, useUpdateProduct } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';

const STORAGE_KEY = 'product_form_state';

interface ProductFormState {
    action: 'add' | 'edit' | 'view';
    productId?: string;
    formValues?: Partial<Product>;
}

/**
 * Save form state to localStorage
 */
const saveFormState = (state: ProductFormState) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error('Failed to save form state:', error);
    }
};

/**
 * Load form state from localStorage
 */
const loadFormState = (): ProductFormState | null => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.error('Failed to load form state:', error);
        return null;
    }
};

/**
 * Clear form state from localStorage
 */
const clearFormState = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear form state:', error);
    }
};

interface ProductFormProps {
    products: Product[];
}

export const ProductForm: React.FC<ProductFormProps> = ({ products }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [initialFormValues, setInitialFormValues] = useState<Partial<Product> | undefined>(undefined);

    const createMutation = useCreateProduct();
    const updateMutation = useUpdateProduct();
    const { data: categories } = useCategories();

    // Get action and productId from URL params
    const action = searchParams.get('action') as 'add' | 'edit' | 'view' | null;
    const productId = searchParams.get('productId');

    // Use useMemo to compute derived values
    const product = useMemo(() => {
        if (action === 'edit' && productId) {
            return products.find(p => p.id === productId) || null;
        }
        return null;
    }, [action, productId, products]);

    const savedState = useMemo(() => {
        if (action === 'add' || action === 'edit') {
            return loadFormState();
        }
        return null;
    }, [action]);

    const computedFormValues = useMemo(() => {
        if (action === 'edit' && product) {
            return {
                name: product.name,
                slug: product.slug,
                description: product.description,
                price: product.price,
                categoryId: product.categoryId,
                imageUrl: product.imageUrl,
                stock: product.stock,
                status: product.status,
            };
        }
        return undefined;
    }, [action, product]);

    // Restore form state from URL params and localStorage
    useEffect(() => {
        if (action === 'add' || action === 'edit') {
            if (action === 'edit' && productId) {
                // For edit action, use computed product from useMemo
                if (product) {
                    // Product found, use computed form values
                    setEditingProduct(product);
                    setInitialFormValues(computedFormValues);
                    setIsModalVisible(true);

                    // Save current state to localStorage
                    saveFormState({
                        action,
                        productId: productId || undefined,
                        formValues: computedFormValues,
                    });
                } else {
                    // Product not found yet, try to restore from localStorage
                    if (savedState && savedState.action === 'edit' && savedState.productId === productId && savedState.formValues) {
                        // Restore form values from localStorage temporarily
                        setInitialFormValues(savedState.formValues);
                        setIsModalVisible(true);
                    } else {
                        // Even if no saved state, open modal with empty form to wait for products
                        setIsModalVisible(true);
                        setInitialFormValues({});
                    }
                }
            } else if (action === 'add') {
                // For add action, check if should restore from localStorage
                const shouldRestore = savedState &&
                    savedState.action === 'add';

                if (shouldRestore && savedState.formValues) {
                    // Restore form values from localStorage
                    setInitialFormValues(savedState.formValues);
                    setIsModalVisible(true);

                    // Save current state to localStorage
                    saveFormState({
                        action,
                        productId: productId || undefined,
                        formValues: savedState.formValues,
                    });
                } else {
                    // Set initial values for add
                    setEditingProduct(null);
                    setInitialFormValues({
                        imageUrl: [],
                        stock: 0,
                        status: 'active',
                    });
                    setIsModalVisible(true);

                    // Save current state to localStorage
                    saveFormState({
                        action,
                        productId: productId || undefined,
                        formValues: {
                            imageUrl: [],
                            stock: 0,
                            status: 'active',
                        },
                    });
                }
            }
        } else if (action === null && isModalVisible) {
            // Only close modal if action is explicitly null and modal is currently visible
            setIsModalVisible(false);
            setEditingProduct(null);
            setInitialFormValues(undefined);
        }
    }, [action, productId, product, savedState, computedFormValues, setSearchParams, isModalVisible]);

    // Save form values to localStorage when form changes
    const handleFormValuesChange = useCallback((values: Partial<Product>) => {
        if (action === 'add' || action === 'edit') {
            saveFormState({
                action,
                productId: productId || undefined,
                formValues: values,
            });
        }
    }, [action, productId]);

    const handleSubmit = (values: Partial<Product>) => {
        // Update form state before submit
        handleFormValuesChange(values);

        // Ensure required fields are present
        if (!values.name || !values.description || values.price === undefined) {
            return;
        }

        const formData = {
            name: values.name,
            description: values.description,
            price: typeof values.price === 'string' ? parseFloat(values.price) || 0 : (values.price || 0),
            categoryId: values.categoryId || '',
            imageUrl: values.imageUrl || [],
            stock: typeof values.stock === 'string' ? parseInt(values.stock, 10) || 0 : (values.stock || 0),
            status: values.status || 'active',
        };

        if (editingProduct) {
            updateMutation.mutate(
                { id: editingProduct.id, data: formData },
                {
                    onSuccess: () => {
                        setIsModalVisible(false);
                        setEditingProduct(null);
                        setInitialFormValues(undefined);
                        clearFormState();
                        setSearchParams({});
                    },
                }
            );
        } else {
            createMutation.mutate(formData, {
                onSuccess: () => {
                    setIsModalVisible(false);
                    setInitialFormValues(undefined);
                    clearFormState();
                    setSearchParams({});
                },
            });
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingProduct(null);
        setInitialFormValues(undefined);
        clearFormState();
        setSearchParams({});
    };

    const productFormFields: DynamicFormField[] = [
        {
            name: 'name',
            label: 'Product Name',
            type: 'text',
            required: true,
            placeholder: 'Enter product name',
        },
        {
            name: 'slug',
            label: 'Slug',
            type: 'text',
            autoGenerate: true,
            placeholder: 'Auto-generated from name',
        },
        {
            name: 'description',
            label: 'Description',
            type: 'textarea',
            required: true,
            placeholder: 'Enter product description',
        },
        {
            name: 'price',
            label: 'Price',
            type: 'text',
            required: true,
            placeholder: 'Enter price (number)',
        },
        {
            name: 'categoryId',
            label: 'Category',
            type: 'select',
            required: true,
            options: [
                { label: 'Select Category', value: '' },
                ...(categories?.map(cat => ({
                    label: cat.name,
                    value: cat.id,
                })) || []),
            ],
        },
        {
            name: 'imageUrl',
            label: 'Product Images',
            type: 'upload',
            required: false,
            maxCount: 8,
            accept: 'image/*',
            listType: 'picture-card',
        },
        {
            name: 'stock',
            label: 'Stock',
            type: 'text',
            required: true,
            placeholder: 'Enter stock quantity (number)',
        },
        {
            name: 'status',
            label: 'Status',
            type: 'select',
            required: true,
            options: [
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
            ],
        },
    ];

    if (!isModalVisible) {
        return null;
    }

    // Determine title and button text based on action
    const isEditMode = action === 'edit';
    const formTitle = isEditMode ? 'Edit Product' : 'Add Product';

    return (
        <DynamicForm
            formData={editingProduct || initialFormValues}
            fields={productFormFields}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onValuesChange={handleFormValuesChange}
            loading={createMutation.isPending || updateMutation.isPending}
            title={formTitle}
            isEditMode={isEditMode}
        />
    );
};

