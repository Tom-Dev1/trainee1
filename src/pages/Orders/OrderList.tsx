import React, { useState } from 'react';
import { Table, Typography, Tag, Space, Button } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { EyeOutlined } from '@ant-design/icons';
import type { Order } from '../../types';
import { ordersApi } from '../../services/api';

const { Title } = Typography;

export const OrderList: React.FC = () => {
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    const { data: ordersData, isLoading } = useQuery({
        queryKey: ['orders', pagination.current, pagination.pageSize],
        queryFn: () =>
            ordersApi.getOrders({
                page: pagination.current,
                pageSize: pagination.pageSize,
            }),
    });

    const handleTableChange = (paginationConfig: any) => {
        setPagination({
            current: paginationConfig.current,
            pageSize: paginationConfig.pageSize,
        });
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'orange',
            processing: 'blue',
            shipped: 'cyan',
            delivered: 'green',
            cancelled: 'red',
        };
        return colors[status] || 'default';
    };

    const columns = [
        {
            title: 'Order ID',
            dataIndex: 'id',
            key: 'id',
            width: 100,
        },
        {
            title: 'Customer',
            dataIndex: 'customerName',
            key: 'customerName',
        },
        {
            title: 'Email',
            dataIndex: 'customerEmail',
            key: 'customerEmail',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {status.toUpperCase()}
                </Tag>
            ),
            filters: [
                { text: 'Pending', value: 'pending' },
                { text: 'Processing', value: 'processing' },
                { text: 'Shipped', value: 'shipped' },
                { text: 'Delivered', value: 'delivered' },
                { text: 'Cancelled', value: 'cancelled' },
            ],
            onFilter: (value: any, record: Order) => record.status === value,
        },
        {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
            render: (total: number) => `$${total.toFixed(2)}`,
            sorter: (a: Order, b: Order) => a.total - b.total,
        },
        {
            title: 'Items',
            dataIndex: 'items',
            key: 'items',
            render: (items: any[]) => items.length,
        },
        {
            title: 'Order Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleDateString(),
            sorter: (a: Order, b: Order) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: () => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                    >
                        View
                    </Button>
                </Space>
            ),
        },
    ];

    const expandedRowRender = (record: Order) => {
        const itemColumns = [
            {
                title: 'Product',
                dataIndex: 'productName',
                key: 'productName',
            },
            {
                title: 'Quantity',
                dataIndex: 'quantity',
                key: 'quantity',
            },
            {
                title: 'Price',
                dataIndex: 'price',
                key: 'price',
                render: (price: number) => `$${price.toFixed(2)}`,
            },
            {
                title: 'Subtotal',
                key: 'subtotal',
                render: (_: any, item: any) => `$${(item.quantity * item.price).toFixed(2)}`,
            },
        ];

        return (
            <Table
                columns={itemColumns}
                dataSource={record.items}
                pagination={false}
                rowKey="id"
                size="small"
            />
        );
    };

    return (
        <div>
            <Title level={2}>Orders</Title>

            <Table
                columns={columns}
                dataSource={ordersData?.data || []}
                rowKey="id"
                loading={isLoading}
                expandable={{
                    expandedRowRender,
                    rowExpandable: (record) => record.items.length > 0,
                }}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: ordersData?.total || 0,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                }}
                onChange={handleTableChange}
            />
        </div>
    );
};