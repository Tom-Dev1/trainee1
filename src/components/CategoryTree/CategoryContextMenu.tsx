import React, { useEffect } from 'react';
import { Menu } from 'antd';
import { EyeOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface CategoryContextMenuProps {
    visible: boolean;
    position: { x: number; y: number };
    onAction: (action: string) => void;
    onClose: () => void;
}

export const CategoryContextMenu: React.FC<CategoryContextMenuProps> = ({
    visible,
    position,
    onAction,
    onClose,
}) => {
    useEffect(() => {
        const handleClickOutside = () => {
            if (visible) {
                onClose();
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && visible) {
                onClose();
            }
        };

        if (visible) {
            document.addEventListener('click', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [visible, onClose]);

    if (!visible) return null;

    const menuItems = [
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
            type: 'divider' as const,
        },
        {
            key: 'delete',
            label: 'Delete',
            icon: <DeleteOutlined />,
            danger: true,
        },
    ];

    return (
        <div
            style={{
                position: 'fixed',
                top: position.y,
                left: position.x,
                zIndex: 1000,
                backgroundColor: '#fff',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08)',
                padding: '4px 0',
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <Menu
                items={menuItems}
                onClick={({ key }) => onAction(key)}
                style={{ border: 'none', minWidth: '160px' }}
            />
        </div>
    );
};