import React from 'react';
import {
    Card,
    Row,
    Col,
    Typography,
    Statistic,
    Table,
    Tag,
    Space,
    Progress,
    List,
    Avatar,
    Empty,
    Spin
} from 'antd';
import {
    SearchOutlined,
    TrophyOutlined,
    ExclamationCircleOutlined,
    BarChartOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { useSearchAnalytics, useRecentSearches } from '../../hooks/useSearch';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

export const SearchAnalytics: React.FC = () => {
    const { data: analytics, isLoading: analyticsLoading } = useSearchAnalytics();
    const { data: recentSearches, isLoading: recentLoading } = useRecentSearches();

    if (analyticsLoading || recentLoading) {
        return (
            <div style={{ padding: 24, textAlign: 'center' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>Loading analytics...</div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div style={{ padding: 24 }}>
                <Empty description="No analytics data available" />
            </div>
        );
    }

    // Popular queries table columns
    const popularQueriesColumns = [
        {
            title: 'Query',
            dataIndex: 'query',
            key: 'query',
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: 'Count',
            dataIndex: 'count',
            key: 'count',
            render: (count: number) => (
                <Tag color="blue" icon={<SearchOutlined />}>
                    {count}
                </Tag>
            ),
        },
        {
            title: 'Last Searched',
            dataIndex: 'lastSearched',
            key: 'lastSearched',
            render: (date: string) => (
                <Text type="secondary">
                    {dayjs(date).fromNow()}
                </Text>
            ),
        },
        {
            title: 'Popularity',
            key: 'popularity',
            render: (_: any, record: any) => {
                const maxCount = Math.max(...analytics.popularQueries.map((q: any) => q.count));
                const percentage = (record.count / maxCount) * 100;
                return (
                    <Progress
                        percent={percentage}
                        size="small"
                        showInfo={false}
                        strokeColor="#1890ff"
                    />
                );
            },
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Title level={2} style={{ marginBottom: 24 }}>
                <BarChartOutlined /> Search Analytics
            </Title>

            {/* Overview Statistics */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Searches"
                            value={analytics.totalSearches}
                            prefix={<SearchOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Unique Queries"
                            value={analytics.popularQueries.length}
                            prefix={<TrophyOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Avg Results/Query"
                            value={analytics.averageResultsPerQuery}
                            precision={1}
                            prefix={<BarChartOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="No Results Queries"
                            value={analytics.noResultsQueries.length}
                            prefix={<ExclamationCircleOutlined />}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                {/* Popular Queries */}
                <Col xs={24} lg={16}>
                    <Card
                        title={
                            <Space>
                                <TrophyOutlined />
                                Popular Search Queries
                            </Space>
                        }
                    >
                        {analytics.popularQueries.length > 0 ? (
                            <Table
                                dataSource={analytics.popularQueries}
                                columns={popularQueriesColumns}
                                rowKey="query"
                                pagination={{ pageSize: 10 }}
                                size="small"
                            />
                        ) : (
                            <Empty description="No popular queries yet" />
                        )}
                    </Card>
                </Col>

                {/* Recent Searches */}
                <Col xs={24} lg={8}>
                    <Card
                        title={
                            <Space>
                                <ClockCircleOutlined />
                                Recent Searches
                            </Space>
                        }
                        style={{ height: '100%' }}
                    >
                        {recentSearches && recentSearches.length > 0 ? (
                            <List
                                dataSource={recentSearches.slice(0, 10)}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar
                                                    icon={<SearchOutlined />}
                                                    size="small"
                                                    style={{ backgroundColor: '#1890ff' }}
                                                />
                                            }
                                            title={
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Text>{item.query}</Text>
                                                    <Tag
                                                        color={item.resultsCount > 0 ? 'green' : 'red'}
                                                    >
                                                        {item.resultsCount}
                                                    </Tag>
                                                </div>
                                            }
                                            description={
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    {dayjs(item.timestamp).fromNow()}
                                                </Text>
                                            }
                                        />
                                    </List.Item>
                                )}
                                size="small"
                            />
                        ) : (
                            <Empty description="No recent searches" />
                        )}
                    </Card>
                </Col>
            </Row>

            {/* No Results Queries */}
            {analytics.noResultsQueries.length > 0 && (
                <Row style={{ marginTop: 16 }}>
                    <Col span={24}>
                        <Card
                            title={
                                <Space>
                                    <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                                    Queries with No Results
                                </Space>
                            }
                        >
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {analytics.noResultsQueries.map((query: string, index: number) => (
                                    <Tag
                                        key={index}
                                        color="red"
                                        style={{ marginBottom: 8 }}
                                    >
                                        {query}
                                    </Tag>
                                ))}
                            </div>
                            <Text type="secondary" style={{ fontSize: '12px', marginTop: 16, display: 'block' }}>
                                These queries returned no results. Consider improving content or search algorithms.
                            </Text>
                        </Card>
                    </Col>
                </Row>
            )}
        </div>
    );
};