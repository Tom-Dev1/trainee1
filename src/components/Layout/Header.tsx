import React from 'react';
import { Layout, Button, Typography, Space } from 'antd';
import { MoonOutlined, SunOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';
import { GlobalSearchBar } from '../GlobalSearch/GlobalSearchBar';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

interface HeaderProps {
    collapsed: boolean;
    onToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ collapsed, onToggle }) => {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <AntHeader
            style={{
                padding: '0 24px',
                background: isDarkMode ? '#001529' : '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`,
            }}
        >
            <Space align="center">
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={onToggle}
                    style={{
                        fontSize: '16px',
                        width: 64,
                        height: 64,
                    }}
                />
                <Title level={3} style={{ margin: 0, color: isDarkMode ? '#fff' : '#000' }}>
                    E-commerce CMS
                </Title>
            </Space>

            {/* Global Search Bar */}
            <div style={{ flex: 1, maxWidth: 500, margin: '0 24px' }}>
                <GlobalSearchBar
                    size="middle"
                    style={{ width: '100%' }}
                />
            </div>

            <Button
                type="text"
                icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
                onClick={toggleTheme}
                style={{
                    fontSize: '16px',
                    color: isDarkMode ? '#fff' : '#000',
                }}
            />
        </AntHeader>
    );
};