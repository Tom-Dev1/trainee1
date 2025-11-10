import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DynamicForm } from '../DynamicForm';
import type { Category, DynamicFormField } from '../../types';
import { useCreateCategory, useUpdateCategory } from '../../hooks/useCategories';

const STORAGE_KEY = 'category_form_state';

interface CategoryFormState {
    action: 'add' | 'edit' | 'view';
    categoryId?: string;
    parentId?: string;
    formValues?: Partial<Category>;
}

/**
 * Save form state to localStorage
 */
const saveFormState = (state: CategoryFormState) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error('Failed to save form state:', error);
    }
};

/**
 * Load form state from localStorage
 */
const loadFormState = (): CategoryFormState | null => {
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

interface CategoryFormProps {
    categories: Category[];
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ categories }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [initialFormValues, setInitialFormValues] = useState<Partial<Category> | undefined>(undefined);

    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();

    // Get action, categoryId, and parentId from URL params
    const action = searchParams.get('action') as 'add' | 'edit' | 'view' | null;
    const categoryId = searchParams.get('categoryId');
    const parentId = searchParams.get('parentId');

    // Use useMemo to compute derived values (category, savedState, formValues)
    const category = useMemo(() => {
        if (action === 'edit' && categoryId) {
            return categories.find(cat => cat.id === categoryId) || null;
        }
        return null;
    }, [action, categoryId, categories]);

    const savedState = useMemo(() => {
        if (action === 'add' || action === 'edit') {
            return loadFormState();
        }
        return null;
    }, [action]);

    const computedFormValues = useMemo(() => {
        if (action === 'edit' && category) {
            return {
                name: category.name,
                slug: category.slug,
                parent_id: category.parent_id,
            };
        }
        if (action === 'add') {
            return {
                parent_id: parentId || null,
            };
        }
        return undefined;
    }, [action, category, parentId]);

    // Restore form state from URL params and localStorage
    useEffect(() => {
        if (action === 'add' || action === 'edit') {
            if (action === 'edit' && categoryId) {
                // For edit action, use computed category from useMemo
                if (category) {
                    // Category found, use computed form values
                    setEditingCategory(category);
                    setInitialFormValues(computedFormValues);
                    setIsModalVisible(true);

                    // Save current state to localStorage
                    saveFormState({
                        action,
                        categoryId: categoryId || undefined,
                        parentId: parentId || undefined,
                        formValues: computedFormValues,
                    });
                } else {
                    // Category not found yet, try to restore from localStorage
                    if (savedState && savedState.action === 'edit' && savedState.categoryId === categoryId && savedState.formValues) {
                        // Restore form values from localStorage temporarily
                        setInitialFormValues(savedState.formValues);
                        setIsModalVisible(true);
                    } else {
                        // Even if no saved state, open modal with empty form to wait for categories
                        // This ensures modal opens immediately when action=edit
                        setIsModalVisible(true);
                        setInitialFormValues({});
                    }
                    // Don't clear params here - wait for categories to load or user to cancel
                }
            } else if (action === 'add') {
                // For add action, check if should restore from localStorage
                const shouldRestore = savedState &&
                    savedState.action === 'add' &&
                    savedState.parentId === parentId;

                if (shouldRestore && savedState.formValues) {
                    // Restore form values from localStorage
                    setInitialFormValues(savedState.formValues);
                    setIsModalVisible(true);

                    // Save current state to localStorage
                    saveFormState({
                        action,
                        categoryId: categoryId || undefined,
                        parentId: parentId || undefined,
                        formValues: savedState.formValues,
                    });
                } else {
                    // Set initial values for add using computed form values
                    setEditingCategory(null);
                    setInitialFormValues(computedFormValues);
                    setIsModalVisible(true);

                    // Save current state to localStorage
                    saveFormState({
                        action,
                        categoryId: categoryId || undefined,
                        parentId: parentId || undefined,
                        formValues: computedFormValues,
                    });
                }
            }
        } else if (action === null && isModalVisible) {
            // Only close modal if action is explicitly null and modal is currently visible
            // This prevents closing modal when URL params are being processed
            setIsModalVisible(false);
            setEditingCategory(null);
            setInitialFormValues(undefined);
        }
    }, [action, categoryId, parentId, category, savedState, computedFormValues, setSearchParams, isModalVisible]);

    // Save form values to localStorage when form changes
    const handleFormValuesChange = useCallback((values: Partial<Category>) => {
        if (action === 'add' || action === 'edit') {
            saveFormState({
                action,
                categoryId: categoryId || undefined,
                parentId: parentId || undefined,
                formValues: values,
            });
        }
    }, [action, categoryId, parentId]);

    const handleSubmit = (values: Partial<Category>) => {
        // Update form state before submit
        handleFormValuesChange(values);

        // Ensure name is present for create/update
        if (!values.name) {
            return;
        }

        const formData = {
            name: values.name,
            parent_id: values.parent_id || null,
        };

        if (editingCategory) {
            updateMutation.mutate(
                { id: editingCategory.id, data: formData },
                {
                    onSuccess: () => {
                        setIsModalVisible(false);
                        setEditingCategory(null);
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
        setEditingCategory(null);
        setInitialFormValues(undefined);
        clearFormState();
        setSearchParams({});
    };

    const categoryFormFields: DynamicFormField[] = [
        {
            name: 'name',
            label: 'Category Name',
            type: 'text',
            required: true,
            placeholder: 'Enter category name',
        },
        {
            name: 'slug',
            label: 'Slug',
            type: 'text',
            autoGenerate: true,
            placeholder: 'Auto-generated from name',
        },
        {
            name: 'parent_id',
            label: 'Parent Category',
            type: 'select',
            options: [
                { label: 'None (Root Category)', value: '' },
                ...(categories
                    .filter(cat => !editingCategory || cat.id !== editingCategory.id) // Exclude self from parent options
                    .map(cat => ({
                        label: cat.name,
                        value: cat.id,
                    })) || []),
            ],
        },
    ];

    if (!isModalVisible) {
        return null;
    }

    // Determine title and button text based on action, not editingCategory
    const isEditMode = action === 'edit';
    const formTitle = isEditMode ? 'Edit Category' : 'Add Category';

    return (
        <DynamicForm
            formData={editingCategory || initialFormValues}
            fields={categoryFormFields}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onValuesChange={handleFormValuesChange}
            loading={createMutation.isPending || updateMutation.isPending}
            title={formTitle}
            isEditMode={isEditMode}
        />
    );
};

