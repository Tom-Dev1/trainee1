import React, { useState } from 'react';
import { Table, Button, Input, Space, Typography, Tag, Avatar, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import type { Profile, DynamicFormField, ContextMenuAction } from '../../types';
import { useProfiles, useCreateProfile, useUpdateProfile, useDeleteProfile } from '../../hooks/useProfiles';
import { DynamicForm } from '../../components/DynamicForm';
import { ContextMenu } from '../../components/ContextMenu';

const { Title } = Typography;

export const ProfileList: React.FC = () => {
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
    const [contextMenuVisible, setContextMenuVisible] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

    const { data: profilesData, isLoading } = useProfiles({
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchText,
    });

    const createMutation = useCreateProfile();
    const updateMutation = useUpdateProfile();
    const deleteMutation = useDeleteProfile();

    const handleSearch = (value: string) => {
        setSearchText(value);
        setPagination({ ...pagination, current: 1 });
    };

    const handleTableChange = (paginationConfig: any) => {
        setPagination({
            current: paginationConfig.current,
            pageSize: paginationConfig.pageSize,
        });
    };

    const handleContextMenu = (e: React.MouseEvent, profile: Profile) => {
        e.preventDefault();
        setSelectedProfile(profile);
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
        if (!selectedProfile) return;

        switch (key) {
            case 'view':
                // Navigate to profile detail (implement if needed)
                break;
            case 'edit':
                setEditingProfile(selectedProfile);
                setIsModalVisible(true);
                break;
            case 'delete':
                handleDelete(selectedProfile);
                break;
        }
        setContextMenuVisible(false);
    };

    const handleAdd = () => {
        setEditingProfile(null);
        setIsModalVisible(true);
    };

    const handleEdit = (profile: Profile) => {
        setEditingProfile(profile);
        setIsModalVisible(true);
    };

    const handleDelete = (profile: Profile) => {
        Modal.confirm({
            title: 'Delete Profile',
            content: `Are you sure you want to delete "${profile.name}"?`,
            onOk: () => {
                deleteMutation.mutate(profile.id);
            },
        });
    };

    const handleSubmit = (values: any) => {
        if (editingProfile) {
            updateMutation.mutate(
                { id: editingProfile.id, data: values },
                {
                    onSuccess: () => {
                        setIsModalVisible(false);
                        setEditingProfile(null);
                    },
                }
            );
        } else {
            createMutation.mutate(values, {
                onSuccess: () => {
                    setIsModalVisible(false);
                },
            });
        }
    };

    const profileFormFields: DynamicFormField[] = [
        {
            name: 'name',
            label: 'Full Name',
            type: 'text',
            required: true,
            placeholder: 'Enter full name',
        },
        {
            name: 'email',
            label: 'Email',
            type: 'email',
            required: true,
            placeholder: 'Enter email address',
        },
        {
            name: 'role',
            label: 'Role',
            type: 'select',
            required: true,
            options: [
                { label: 'Admin', value: 'admin' },
                { label: 'Editor', value: 'editor' },
                { label: 'Viewer', value: 'viewer' },
            ],
        },
        {
            name: 'avatar',
            label: 'Avatar URL',
            type: 'text',
            placeholder: 'Enter avatar URL (optional)',
        },
    ];

    const columns = [
        {
            title: 'Avatar',
            dataIndex: 'avatar',
            key: 'avatar',
            width: 80,
            render: (avatar: string, record: Profile) => (
                <Avatar src={avatar} size={40}>
                    {record.name.charAt(0).toUpperCase()}
                </Avatar>
            ),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a: Profile, b: Profile) => a.name.localeCompare(b.name),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => {
                const colors = {
                    admin: 'red',
                    editor: 'blue',
                    viewer: 'green',
                };
                return (
                    <Tag color={colors[role as keyof typeof colors]}>
                        {role.toUpperCase()}
                    </Tag>
                );
            },
            filters: [
                { text: 'Admin', value: 'admin' },
                { text: 'Editor', value: 'editor' },
                { text: 'Viewer', value: 'viewer' },
            ],
            onFilter: (value: any, record: Profile) => record.role === value,
        },
        {
            title: 'Created',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => new Date(date).toLocaleDateString(),
            sorter: (a: Profile, b: Profile) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Profile) => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={2}>Profiles</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Add Profile
                </Button>
            </div>

            <Space style={{ marginBottom: 16 }}>
                <Input.Search
                    placeholder="Search profiles..."
                    allowClear
                    onSearch={handleSearch}
                    style={{ width: 300 }}
                    prefix={<SearchOutlined />}
                />
            </Space>

            <Table
                columns={columns}
                dataSource={profilesData?.data || []}
                rowKey="id"
                loading={isLoading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: profilesData?.total || 0,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                }}
                onChange={handleTableChange}
                onRow={(record) => ({
                    onContextMenu: (e) => handleContextMenu(e, record),
                })}
            />

            {isModalVisible && (
                <DynamicForm
                    formData={editingProfile}
                    fields={profileFormFields}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setIsModalVisible(false);
                        setEditingProfile(null);
                    }}
                    loading={createMutation.isPending || updateMutation.isPending}
                    title={editingProfile ? 'Edit Profile' : 'Add Profile'}
                />
            )}

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