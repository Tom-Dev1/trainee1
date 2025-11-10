import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Space, Upload, message } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { DynamicFormProps, DynamicFormField } from '../../types';
import { toSlug } from '../../utils/slug';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

export const DynamicForm = <T extends Record<string, unknown>>({
    formData,
    fields,
    onSubmit,
    onCancel,
    loading = false,
    title = 'Form',
    onValuesChange,
    isEditMode,
}: DynamicFormProps<T>) => {
    const [form] = Form.useForm();
    const [slugPreview, setSlugPreview] = useState('');
    const [fileLists, setFileLists] = useState<Record<string, UploadFile[]>>({});

    useEffect(() => {
        if (formData) {
            // Convert date strings to dayjs objects for DatePicker
            const processedData = { ...formData } as Record<string, unknown>;
            const newFileLists: Record<string, UploadFile[]> = {};

            fields.forEach(field => {
                if (field.type === 'date' && processedData[field.name]) {
                    const dateValue = processedData[field.name];
                    if (typeof dateValue === 'string') {
                        processedData[field.name] = dayjs(dateValue);
                    }
                } else if (field.type === 'upload' && processedData[field.name]) {
                    // Convert string[] to UploadFile[]
                    const imageUrls = processedData[field.name];
                    if (Array.isArray(imageUrls)) {
                        const fileList: UploadFile[] = imageUrls.map((url, index) => ({
                            uid: `-${index}`,
                            name: `image-${index}`,
                            status: 'done',
                            url: url,
                            preview: url, // Add preview for existing images
                        }));
                        newFileLists[field.name] = fileList;
                        // Don't set form value for upload field, use fileList state instead
                        delete processedData[field.name];
                    }
                }
            });

            setFileLists(newFileLists);
            form.setFieldsValue(processedData as T);

            // Set initial slug preview if editing
            if ('slug' in formData && typeof formData.slug === 'string') {
                setSlugPreview(formData.slug);
            }
        } else {
            // Clear fileLists when formData is cleared
            setFileLists({});
        }
    }, [formData, fields, form]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slugField = fields.find(f => f.autoGenerate);
        if (slugField && name) {
            const generatedSlug = toSlug(name);
            setSlugPreview(generatedSlug);
            form.setFieldValue(slugField.name, generatedSlug);
        }
    };

    const handleSubmit = async (values: T) => {
        // Convert dayjs objects back to ISO strings for date fields
        // Convert UploadFile[] to string[] for upload fields
        const processedValues = { ...values } as Record<string, unknown>;
        fields.forEach(field => {
            if (field.type === 'date' && processedValues[field.name]) {
                const dateValue = processedValues[field.name];
                if (dateValue && typeof dateValue === 'object' && 'toISOString' in dateValue) {
                    processedValues[field.name] = (dateValue as { toISOString: () => string }).toISOString();
                }
            } else if (field.type === 'upload') {
                // Convert UploadFile[] to string[] (URLs)
                const fileList = fileLists[field.name] || [];
                processedValues[field.name] = fileList
                    .filter(file => file.status === 'done' && (file.url || file.preview))
                    .map(file => (file.url || file.preview) as string);
            }
        });

        onSubmit(processedValues as T);
    };

    const handleUploadChange = (fieldName: string): UploadProps['onChange'] => (info) => {
        let { fileList } = info;

        // Convert File objects to data URLs for preview and storage
        fileList = fileList.map(file => {
            if (file.originFileObj && !file.url && !file.preview) {
                // Create preview URL for new files using FileReader
                const reader = new FileReader();
                reader.onload = (e) => {
                    const url = e.target?.result as string;
                    setFileLists(prev => {
                        const currentList = prev[fieldName] || [];
                        const updatedList = currentList.map(f =>
                            f.uid === file.uid ? { ...f, url, preview: url, status: 'done' as const } : f
                        );
                        return { ...prev, [fieldName]: updatedList };
                    });
                };
                reader.onerror = () => {
                    message.error(`Failed to read file: ${file.name}`);
                };
                reader.readAsDataURL(file.originFileObj);
                return { ...file, status: 'uploading' as const };
            }
            return file;
        });

        setFileLists(prev => ({ ...prev, [fieldName]: fileList }));

        // Handle upload status
        if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    };

    const beforeUpload = (file: File, maxCount?: number, currentCount?: number) => {
        const isValidType = file.type.startsWith('image/');
        if (!isValidType) {
            message.error('You can only upload image files!');
            return Upload.LIST_IGNORE;
        }
        const isLt10M = file.size / 1024 / 1024 < 10;
        if (!isLt10M) {
            message.error('Image must be smaller than 10MB!');
            return Upload.LIST_IGNORE;
        }
        if (maxCount && currentCount && currentCount >= maxCount) {
            message.error(`Maximum ${maxCount} images allowed!`);
            return Upload.LIST_IGNORE;
        }
        return false; // Prevent auto upload, handle manually
    };

    const renderField = (field: DynamicFormField) => {
        const commonProps = {
            placeholder: field.placeholder,
            disabled: field.disabled,
        };

        switch (field.type) {
            case 'textarea':
                return <TextArea rows={3} {...commonProps} />;

            case 'select':
                return (
                    <Select {...commonProps} allowClear>
                        {field.options?.map(option => (
                            <Option key={option.value} value={option.value}>
                                {option.label}
                            </Option>
                        ))}
                    </Select>
                );

            case 'date':
                return <DatePicker {...commonProps} style={{ width: '100%' }} />;

            case 'email':
                return <Input type="email" {...commonProps} />;

            case 'upload': {
                const fileList = fileLists[field.name] || [];
                const maxCount = field.maxCount || 8;
                const listType = field.listType || 'picture-card';
                const accept = field.accept || 'image/*';

                return (
                    <Upload
                        listType={listType}
                        fileList={fileList}
                        onChange={handleUploadChange(field.name)}
                        beforeUpload={(file) => beforeUpload(file, maxCount, fileList.length)}
                        multiple
                        accept={accept}
                        maxCount={maxCount}
                    >
                        {fileList.length < maxCount && (
                            <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        )}
                    </Upload>
                );
            }

            case 'hidden':
                return <Input type="hidden" />;

            case 'text':
            default:
                return (
                    <Input
                        {...commonProps}
                        onChange={field.autoGenerate ? undefined : (field.name === 'name' ? handleNameChange : undefined)}
                    />
                );
        }
    };

    return (
        <Modal
            title={title}
            open={true}
            onCancel={onCancel}
            footer={null}
            width={600}
            destroyOnHidden         >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                onValuesChange={(_, allValues) => {
                    onValuesChange?.(allValues as Partial<T>);
                }}
                initialValues={formData}
            >
                {fields.map(field => {
                    if (field.type === 'hidden') {
                        return (
                            <Form.Item key={field.name} name={field.name} hidden>
                                {renderField(field)}
                            </Form.Item>
                        );
                    }

                    return (
                        <Form.Item
                            key={field.name}
                            name={field.name}
                            label={field.label}
                            rules={[
                                {
                                    required: field.required,
                                    message: `Please enter ${field.label.toLowerCase()}`,
                                },
                                ...(field.type === 'email' ? [
                                    {
                                        type: 'email' as const,
                                        message: 'Please enter a valid email address',
                                    }
                                ] : []),
                            ]}
                        >
                            {field.name === 'name' ? (
                                <Input
                                    {...(field.disabled ? { disabled: true } : {})}
                                    placeholder={field.placeholder}
                                    onChange={handleNameChange}
                                />
                            ) : (
                                renderField(field)
                            )}
                        </Form.Item>
                    );
                })}

                {slugPreview && (
                    <div style={{ marginBottom: 16 }}>
                        <span style={{ color: '#666', fontSize: '12px' }}>
                            URL Slug: <code>{slugPreview}</code>
                        </span>
                    </div>
                )}

                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            {isEditMode !== undefined ? (isEditMode ? 'Update' : 'Create') : (formData ? 'Update' : 'Create')}
                        </Button>
                        <Button onClick={onCancel}>
                            Cancel
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};