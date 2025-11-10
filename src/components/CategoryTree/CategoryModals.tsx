import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Space, Button, Typography } from 'antd';
import type { Category, CategoryFormData } from '../../types';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../hooks/useCategories';
import { toSlug } from '../../utils/slug';

const { Text } = Typography;
const { Option } = Select;

interface CategoryModalsProps {
    type: 'add' | 'edit' | 'delete' | null;
    category: Category | null;
    onClose: () => void;
}

export const CategoryModals: React.FC<CategoryModalsProps> = ({ type, category, onClose }) => {
    const [form] = Form.useForm();
    const [slugPreview, setSlugPreview] = useState('');

    const { data: categories } = useCategories();
    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();
    const deleteMutation = useDeleteCategory();

    // Flatten categories for parent selection
    const flatCategories = React.useMemo(() => {
        if (!categories) return [];

        const flatten = (cats: Category[]): Category[] => {
            const result: Category[] = [];
            cats.forEach(cat => {
                const { children, ...flatCat } = cat as any;
                result.push(flatCat);
                if (children) {
                    result.push(...flatten(children));
                }
            });
            return result;
        };

        return flatten(categories);
    }, [categories]);

    useEffect(() => {
        if (type === 'add') {
            form.resetFields();
            setSlugPreview('');
            // Pre-select parent if adding subcategory
            if (category) {
                form.setFieldValue('parent_id', category.id);
            }
        } else if (type === 'edit' && category) {
            form.setFieldsValue({
                name: category.name,
                parent_id: category.parent_id,
            });
            setSlugPreview(category.slug);
        }
    }, [type, category, form]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        if (name) {
            setSlugPreview(toSlug(name));
        } else {
            setSlugPreview('');
        }
    };

    const handleSubmit = async (values: CategoryFormData) => {
        try {
            if (type === 'add') {
                await createMutation.mutateAsync(values);
            } else if (type === 'edit' && category) {
                await updateMutation.mutateAsync({ id: category.id, data: values });
            }
            onClose();
        } catch (error) {
            console.error('Failed to save category:', error);
        }
    };

    const handleDelete = async () => {
        if (!category) return;

        try {
            await deleteMutation.mutateAsync(category.id);
            onClose();
        } catch (error) {
            console.error('Failed to delete category:', error);
        }
    };

    const getAvailableParents = () => {
        if (!flatCategories) return [];

        // For edit mode, exclude the category itself and its descendants
        if (type === 'edit' && category) {
            return flatCategories.filter(cat => {
                if (cat.id === category.id) return false;
                // Check if this category is a descendant of the current category
                let parent = flatCategories.find(p => p.id === cat.parent_id);
                while (parent) {
                    if (parent.id === category.id) return false;
                    const parentId = parent.parent_id;
                    parent = parentId ? flatCategories.find(p => p.id === parentId) : undefined;
                }
                return true;
            });
        }

        return flatCategories;
    };

    const getBreadcrumb = (categoryId: string): string => {
        const buildPath = (id: string): string[] => {
            const cat = flatCategories.find(c => c.id === id);
            if (!cat) return [];

            const path = [cat.name];
            if (cat.parent_id) {
                path.unshift(...buildPath(cat.parent_id));
            }
            return path;
        };

        return buildPath(categoryId).join(' > ');
    };

    // Check if category has children (for delete validation)
    const hasChildren = category ? flatCategories.some(c => c.parent_id === category.id) : false;

    return (
        <>
            {/* Add/Edit Modal */}
            <Modal
                title={type === 'add' ? 'Add Category' : 'Edit Category'}
                open={type === 'add' || type === 'edit'}
                onCancel={onClose}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Category Name"
                        rules={[
                            { required: true, message: 'Please enter category name' },
                            { min: 2, message: 'Name must be at least 2 characters' },
                        ]}
                    >
                        <Input
                            placeholder="Enter category name"
                            onChange={handleNameChange}
                        />
                    </Form.Item>

                    {slugPreview && (
                        <div style={{ marginBottom: 16 }}>
                            <Text type="secondary">URL Slug: </Text>
                            <Text code>{slugPreview}</Text>
                        </div>
                    )}

                    <Form.Item
                        name="parent_id"
                        label="Parent Category"
                    >
                        <Select
                            placeholder="Select parent category (optional)"
                            allowClear
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {getAvailableParents().map(cat => (
                                <Option key={cat.id} value={cat.id}>
                                    {getBreadcrumb(cat.id)}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={createMutation.isPending || updateMutation.isPending}
                            >
                                {type === 'add' ? 'Create' : 'Update'}
                            </Button>
                            <Button onClick={onClose}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Delete Modal */}
            <Modal
                title="Delete Category"
                open={type === 'delete'}
                onCancel={onClose}
                footer={[
                    <Button key="cancel" onClick={onClose}>
                        Cancel
                    </Button>,
                    <Button
                        key="delete"
                        type="primary"
                        danger
                        onClick={handleDelete}
                        loading={deleteMutation.isPending}
                        disabled={hasChildren}
                    >
                        Delete
                    </Button>,
                ]}
            >
                {category && (
                    <div>
                        <p>Are you sure you want to delete the category <strong>"{category.name}"</strong>?</p>

                        {hasChildren && (
                            <div style={{
                                padding: '12px',
                                backgroundColor: '#fff2f0',
                                border: '1px solid #ffccc7',
                                borderRadius: '6px',
                                marginTop: '16px'
                            }}>
                                <Text type="danger">
                                    This category cannot be deleted because it has subcategories.
                                    Please delete or move the subcategories first.
                                </Text>
                            </div>
                        )}

                        {!hasChildren && (
                            <Text type="secondary">This action cannot be undone.</Text>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
};