import React from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import {
    ShoppingOutlined,
    ShoppingCartOutlined,
    DollarOutlined,
    AppstoreOutlined,
} from '@ant-design/icons';
import { dashboardApi } from '../services/api';

const { Title } = Typography;

export const Dashboard: React.FC = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: dashboardApi.getStats,
    });

    return (
        <div>
            <Title level={2}>Dashboard</Title>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Products"
                            value={stats?.totalProducts || 0}
                            prefix={<ShoppingOutlined />}
                            loading={isLoading}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Orders"
                            value={stats?.totalOrders || 0}
                            prefix={<ShoppingCartOutlined />}
                            loading={isLoading}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
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
                    <Card>
                        <Statistic
                            title="Total Categories"
                            value={stats?.totalCategories || 0}
                            prefix={<AppstoreOutlined />}
                            loading={isLoading}
                        />
                    </Card>
                </Col>
            </Row>

        </div>
    );
};