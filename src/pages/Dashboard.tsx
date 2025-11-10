import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingOutlined,
    ShoppingCartOutlined,
    DollarOutlined,
    AppstoreOutlined,
    EyeOutlined,
    PlusOutlined,

} from '@ant-design/icons';
import { dashboardApi } from '../services/api';
import type { ContextMenuAction } from '../types';
import { ContextMenu } from '../components/ContextMenu'

const { Title } = Typography;

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [contextMenuVisible, setContextMenuVisible] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
    const [selectedCard, setSelectedCard] = useState<string | null>(null);

    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: dashboardApi.getStats,
    });

    const handleContextMenu = (e: React.MouseEvent, cardType: string) => {
        e.preventDefault();
        setSelectedCard(cardType);
        setContextMenuPosition({ x: e.clientX, y: e.clientY });
        setContextMenuVisible(true);
    };

    const getContextMenuActions = (): ContextMenuAction[] => {
        const baseActions = [
            {
                key: 'view',
                label: 'View',
                icon: <EyeOutlined />,
            },
            {
                key: 'add',
                label: 'Add New',
                icon: <PlusOutlined />,
            },
        ];

        return baseActions;
    };

    const handleContextMenuAction = (key: string) => {
        if (!selectedCard) return;

        switch (key) {
            case 'view':
                navigate(`/${selectedCard}`);
                break;
            case 'add':
                navigate(`/${selectedCard}?action=add`);
                break;
        }
        setContextMenuVisible(false);
    };

    return (
        <div>
            <Title level={2}>Dashboard</Title>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        hoverable
                        onContextMenu={(e) => handleContextMenu(e, 'products')}
                        onClick={() => navigate('/products')}
                        style={{ cursor: 'pointer' }}
                    >
                        <Statistic
                            title="Total Products"
                            value={stats?.totalProducts || 0}
                            prefix={<ShoppingOutlined />}
                            loading={isLoading}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card
                        hoverable
                        onContextMenu={(e) => handleContextMenu(e, 'orders')}
                        onClick={() => navigate('/orders')}
                        style={{ cursor: 'pointer' }}
                    >
                        <Statistic
                            title="Total Orders"
                            value={stats?.totalOrders || 0}
                            prefix={<ShoppingCartOutlined />}
                            loading={isLoading}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card
                        hoverable
                        onContextMenu={(e) => handleContextMenu(e, 'orders')}
                        style={{ cursor: 'pointer' }}
                    >
                        <Statistic
                            title="Total Revenue"
                            value={stats?.totalRevenue || 0}
                            prefix={<DollarOutlined />}
                            precision={2}
                            loading={isLoading}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card
                        hoverable
                        onContextMenu={(e) => handleContextMenu(e, 'categories')}
                        onClick={() => navigate('/categories')}
                        style={{ cursor: 'pointer' }}
                    >
                        <Statistic
                            title="Total Categories"
                            value={stats?.totalCategories || 0}
                            prefix={<AppstoreOutlined />}
                            loading={isLoading}
                        />
                    </Card>
                </Col>
            </Row>

            <ContextMenu
                visible={contextMenuVisible}
                position={contextMenuPosition}
                actions={selectedCard ? getContextMenuActions() : []}
                onAction={handleContextMenuAction}
                onClose={() => setContextMenuVisible(false)}
            />
            <div>
            </div>
        </div>
    );
};