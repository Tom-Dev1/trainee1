import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Typography,
    Input,
    Select,
    Button,
    Space,
    Tag,
    Avatar,
    Empty,
    Spin,
    Pagination,
    Collapse,
    Slider,
    DatePicker,
    Checkbox
} from 'antd';
import {
    SearchOutlined,
    ShoppingOutlined,
    AppstoreOutlined,
    UserOutlined,
    ShoppingCartOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSearch } from '../../hooks/useSearch';
import type { SearchResult, SearchFilters } from '../../types';


const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { RangePicker } = DatePicker;

export const SearchResults: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState<SearchFilters>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const query = searchParams.get('q') || '';
    const typeFilter = searchParams.get('type');

    const { data: searchResults, isLoading, error } = useSearch({
        query,
        filters: {
            ...filters,
            type: typeFilter ? [typeFilter as any] : filters.type,
        },
        page: currentPage,
        pageSize,
    }, !!query);

    // Update filters when URL params change
    useEffect(() => {
        if (typeFilter) {
            setFilters((prev: SearchFilters) => ({ ...prev, type: [typeFilter as any] }));
        }
    }, [typeFilter]);

    // Handle filter changes
    const handleFilterChange = (key: keyof SearchFilters, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        setCurrentPage(1);

        // Update URL params
        const newParams = new URLSearchParams(searchParams);
        if (key === 'type' && value?.length > 0) {
            newParams.set('type', value[0]);
        } else if (key === 'type') {
            newParams.delete('type');
        }
        setSearchParams(newParams);
    };

    // Handle search query change
    const handleSearchChange = (newQuery: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (newQuery) {
            newParams.set('q', newQuery);
        } else {
            newParams.delete('q');
        }
        setSearchParams(newParams);
    };

    // Get result type icon
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'product': return <ShoppingOutlined />;
            case 'category': return <AppstoreOutlined />;
            case 'profile': return <UserOutlined />;
            case 'order': return <ShoppingCartOutlined />;
            default: return <SearchOutlined />;
        }
    };

    // Get result type color
    const getTypeColor = (type: string) => {
        switch (type) {
            case 'product': return 'blue';
            case 'category': return 'green';
            case 'profile': return 'purple';
            case 'order': return 'orange';
            default: return 'default';
        }
    };

    // Get order status color
    const getOrderStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'green';
            case 'processing': return 'blue';
            case 'pending': return 'orange';
            case 'cancelled': return 'red';
            default: return 'default';
        }
    };

    // Render search result item
    const renderResultItem = (result: SearchResult) => (
        <Card
            key={result.id}
            hoverable
            style={{ marginBottom: 16 }}
            onClick={() => navigate(result.url)}
            actions={[
                <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(result.url);
                    }}
                >
                    View
                </Button>
            ]}
        >
            <Card.Meta
                avatar={
                    result.imageUrl ? (
                        <Avatar src={result.imageUrl} size={48} />
                    ) : (
                        <Avatar icon={getTypeIcon(result.type)} size={48} />
                    )
                }
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span dangerouslySetInnerHTML={{ __html: result.title }} />
                        <Tag color={getTypeColor(result.type)} icon={getTypeIcon(result.type)}>
                            {result.type.toUpperCase()}
                        </Tag>
                    </div>
                }
                description={
                    <div>
                        <div dangerouslySetInnerHTML={{ __html: result.description }} />
                        {result.metadata && (
                            <div style={{ marginTop: 8 }}>
                                {result.type === 'product' && (
                                    <Space>
                                        <Tag>${result.metadata.price}</Tag>
                                        <Tag color={result.metadata.status === 'active' ? 'green' : 'red'}>
                                            {result.metadata.status}
                                        </Tag>
                                        <Tag>{result.metadata.stock} in stock</Tag>
                                    </Space>
                                )}
                                {result.type === 'order' && (
                                    <Space>
                                        <Tag>${result.metadata.total}</Tag>
                                        <Tag color={getOrderStatusColor(result.metadata.status)}>
                                            {result.metadata.status}
                                        </Tag>
                                    </Space>
                                )}
                                {result.type === 'profile' && (
                                    <Tag color="blue">{result.metadata.role}</Tag>
                                )}
                            </div>
                        )}
                    </div>
                }
            />
        </Card>
    );

    // Render results section
    const renderResultsSection = (title: string, results: SearchResult[], icon: React.ReactNode) => {
        if (results.length === 0) return null;

        return (
            <div style={{ marginBottom: 32 }}>
                <Title level={4} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {icon}
                    {title} ({results.length})
                </Title>
                {results.map(renderResultItem)}
            </div>
        );
    };

    // Advanced filters panel
    const filtersPanel = (
        <Card title="Filters" style={{ marginBottom: 16 }}>
            <Collapse ghost>
                <Panel header="Content Type" key="type">
                    <Checkbox.Group
                        value={filters.type || []}
                        onChange={(value) => handleFilterChange('type', value)}
                        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                    >
                        <Checkbox value="product">
                            <ShoppingOutlined /> Products
                        </Checkbox>
                        <Checkbox value="category">
                            <AppstoreOutlined /> Categories
                        </Checkbox>
                        <Checkbox value="profile">
                            <UserOutlined /> Profiles
                        </Checkbox>
                        <Checkbox value="order">
                            <ShoppingCartOutlined /> Orders
                        </Checkbox>
                    </Checkbox.Group>
                </Panel>

                <Panel header="Date Range" key="date">
                    <RangePicker
                        style={{ width: '100%' }}
                        onChange={(dates) => {
                            if (dates && dates[0] && dates[1]) {
                                handleFilterChange('dateRange', {
                                    start: dates[0].toISOString(),
                                    end: dates[1].toISOString(),
                                });
                            } else {
                                handleFilterChange('dateRange', undefined);
                            }
                        }}
                    />
                </Panel>

                <Panel header="Price Range" key="price">
                    <Slider
                        range
                        min={0}
                        max={2000}
                        defaultValue={[0, 2000]}
                        onChange={(value) => {
                            handleFilterChange('priceRange', {
                                min: value[0],
                                max: value[1],
                            });
                        }}
                        tooltip={{ formatter: (value) => `$${value}` }}
                    />
                </Panel>
            </Collapse>

            <Button
                block
                style={{ marginTop: 16 }}
                onClick={() => {
                    setFilters({});
                    setSearchParams({ q: query });
                }}
            >
                Clear Filters
            </Button>
        </Card>
    );

    if (!query) {
        return (
            <div style={{ padding: 24, textAlign: 'center' }}>
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Enter a search query to get started"
                />
            </div>
        );
    }

    return (
        <div style={{ padding: 24 }}>
            {/* Search Header */}
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>Search Results</Title>
                <Input.Search
                    size="large"
                    placeholder="Search products, categories, profiles..."
                    value={query}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onSearch={handleSearchChange}
                    style={{ maxWidth: 600 }}
                />
            </div>

            {isLoading && (
                <div style={{ textAlign: 'center', padding: 50 }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16 }}>Searching...</div>
                </div>
            )}

            {error && (
                <Card>
                    <Empty
                        description="Something went wrong while searching. Please try again."
                    />
                </Card>
            )}

            {searchResults && (
                <Row gutter={24}>
                    {/* Filters Sidebar */}
                    <Col xs={24} lg={6}>
                        {filtersPanel}
                    </Col>

                    {/* Results */}
                    <Col xs={24} lg={18}>
                        {/* Results Summary */}
                        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text type="secondary">
                                Found {searchResults.total} results for "{query}" in {searchResults.took}ms
                            </Text>
                            <Space>
                                <Select
                                    value={pageSize}
                                    onChange={setPageSize}
                                    style={{ width: 120 }}
                                >
                                    <Option value={10}>10 per page</Option>
                                    <Option value={20}>20 per page</Option>
                                    <Option value={50}>50 per page</Option>
                                </Select>
                            </Space>
                        </div>

                        {searchResults.total === 0 ? (
                            <Card>
                                <Empty
                                    description={
                                        <div>
                                            <div>No results found for "{query}"</div>
                                            {searchResults.suggestions && (
                                                <div style={{ marginTop: 16 }}>
                                                    <Text type="secondary">Suggestions:</Text>
                                                    <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                                                        {searchResults.suggestions.map((suggestion: string, index: number) => (
                                                            <li key={index}>{suggestion}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    }
                                />
                            </Card>
                        ) : (
                            <div>
                                {/* Results by Type */}
                                {renderResultsSection(
                                    'Products',
                                    searchResults.results.products,
                                    <ShoppingOutlined />
                                )}
                                {renderResultsSection(
                                    'Categories',
                                    searchResults.results.categories,
                                    <AppstoreOutlined />
                                )}
                                {renderResultsSection(
                                    'Profiles',
                                    searchResults.results.profiles,
                                    <UserOutlined />
                                )}
                                {renderResultsSection(
                                    'Orders',
                                    searchResults.results.orders,
                                    <ShoppingCartOutlined />
                                )}

                                {/* Pagination */}
                                {searchResults.total > pageSize && (
                                    <div style={{ textAlign: 'center', marginTop: 32 }}>
                                        <Pagination
                                            current={currentPage}
                                            total={searchResults.total}
                                            pageSize={pageSize}
                                            onChange={setCurrentPage}
                                            showSizeChanger={false}
                                            showQuickJumper
                                            showTotal={(total, range) =>
                                                `${range[0]}-${range[1]} of ${total} results`
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </Col>
                </Row>
            )}
        </div>
    );
};