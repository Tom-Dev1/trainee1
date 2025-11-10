import React, { useEffect } from 'react';
import { Menu } from 'antd';
import type { ContextMenuAction } from '../../types';

interface ContextMenuProps {
    visible: boolean;
    position: { x: number; y: number };
    actions: ContextMenuAction[];
    onAction: (key: string) => void;
    onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
    visible,
    position,
    actions,
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

    const menuItems = actions.map(action => ({
        key: action.key,
        label: action.label,
        icon: action.icon,
        danger: action.danger,
    }));

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