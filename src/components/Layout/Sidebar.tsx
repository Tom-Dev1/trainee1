import React, { useState } from 'react';
import { Layout, Menu, Divider, Typography, Button, Space } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    DashboardOutlined,
    ShoppingOutlined,
    ShoppingCartOutlined,
    PlusOutlined,
    DownOutlined,
    RightOutlined,
} from '@ant-design/icons';
import { CategoryTree } from '../CategoryTree';
import { useCategories } from '../../hooks/useCategories';

const { Text } = Typography;

const { Sider } = Layout;

interface SidebarProps {
    collapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [categoriesExpanded, setCategoriesExpanded] = useState(true);

    const { data: categories, isLoading: categoriesLoading } = useCategories();

    const menuItems = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/products',
            icon: <ShoppingOutlined />,
            label: 'Products',
        },
        {
            key: '/orders',
            icon: <ShoppingCartOutlined />,
            label: 'Orders',
        },
    ];

    const handleMenuClick = ({ key }: { key: string }) => {
        navigate(key);
    };

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            width={280}
            style={{
                overflow: 'auto',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
            }}
        >
            <div
                style={{
                    height: 32,
                    margin: 16,
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: 6,
                }}
            />

            <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[location.pathname.startsWith('/categories') ? '' : location.pathname]}
                items={menuItems}
                onClick={handleMenuClick}
            />

            {!collapsed && (
                <>
                    <Divider style={{ borderColor: '#434343', margin: '8px 0' }} />

                    <div style={{ padding: '0 16px' }}>
                        <Space
                            style={{
                                width: '100%',
                                justifyContent: 'space-between',
                                marginBottom: 8,
                                cursor: 'pointer'
                            }}
                            onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                        >
                            <Space>
                                {categoriesExpanded ? <DownOutlined /> : <RightOutlined />}
                                <Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                                    Categories
                                </Text>
                            </Space>
                            <Button
                                type="text"
                                size="small"
                                icon={<PlusOutlined />}
                                style={{ color: 'rgba(255, 255, 255, 0.65)' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/categories?action=add');
                                }}
                            />
                        </Space>

                        {categoriesExpanded && (
                            <div style={{
                                maxHeight: 'calc(100vh - 300px)',
                                overflowY: 'auto',
                                paddingRight: 8
                            }}>
                                <CategoryTree
                                    categories={categories || []}
                                    loading={categoriesLoading}
                                />
                            </div>
                        )}
                    </div>
                </>
            )}
        </Sider>
    );
};