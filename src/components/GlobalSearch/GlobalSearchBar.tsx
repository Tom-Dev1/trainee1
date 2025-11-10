import React, { useState, useRef, useEffect } from 'react';
import { Input, Dropdown, Button, Space, Typography, Tag } from 'antd';
import { SearchOutlined, ClockCircleOutlined, FireOutlined, ClearOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useRecentSearches, useSearchSuggestions, useClearRecentSearches } from '../../hooks/useSearch';
import type { RecentSearch } from '../../types';

const { Text } = Typography;

interface GlobalSearchBarProps {
    placeholder?: string;
    size?: 'small' | 'middle' | 'large';
    style?: React.CSSProperties;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
    placeholder = 'Search products, categories, profiles...',
    size = 'middle',
    style,
}) => {
    const navigate = useNavigate();
    const [searchValue, setSearchValue] = useState('');
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const inputRef = useRef<any>(null);

    const { data: recentSearches } = useRecentSearches();
    const suggestions = useSearchSuggestions(searchValue);
    const clearRecentMutation = useClearRecentSearches();

    // Handle search submission
    const handleSearch = (value: string) => {
        if (value.trim()) {
            navigate(`/search?q=${encodeURIComponent(value.trim())}`);
            setSearchValue('');
            setIsDropdownVisible(false);
        }
    };

    // Handle input change
    const handleInputChange = (value: string) => {
        setSearchValue(value);
        setIsDropdownVisible(value.length > 0 || Boolean(recentSearches && recentSearches.length > 0));
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion: string) => {
        setSearchValue(suggestion);
        handleSearch(suggestion);
    };

    // Handle recent search click
    const handleRecentSearchClick = (recentSearch: RecentSearch) => {
        handleSearch(recentSearch.query);
    };

    // Clear recent searches
    const handleClearRecent = (e: React.MouseEvent) => {
        e.stopPropagation();
        clearRecentMutation.mutate();
    };

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }

            // Escape to close dropdown
            if (e.key === 'Escape') {
                setIsDropdownVisible(false);
                inputRef.current?.blur();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Build dropdown content
    const dropdownContent = (
        <div style={{ width: 400, maxHeight: 400, overflow: 'auto' }}>
            {/* Search Suggestions */}
            {suggestions.length > 0 && (
                <div style={{ padding: '8px 12px' }}>
                    <Text type="secondary" style={{ fontSize: '12px', fontWeight: 500 }}>
                        <FireOutlined /> SUGGESTIONS
                    </Text>
                    <div style={{ marginTop: 8 }}>
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: '6px 8px',
                                    cursor: 'pointer',
                                    borderRadius: 4,
                                    marginBottom: 2,
                                }}
                                className="search-suggestion-item"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                <SearchOutlined style={{ marginRight: 8, color: '#999' }} />
                                {suggestion}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Searches */}
            {recentSearches && recentSearches.length > 0 && (
                <div style={{ padding: '8px 12px', borderTop: suggestions.length > 0 ? '1px solid #f0f0f0' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text type="secondary" style={{ fontSize: '12px', fontWeight: 500 }}>
                            <ClockCircleOutlined /> RECENT SEARCHES
                        </Text>
                        <Button
                            type="text"
                            size="small"
                            icon={<ClearOutlined />}
                            onClick={handleClearRecent}
                            loading={clearRecentMutation.isPending}
                            style={{ fontSize: '12px' }}
                        >
                            Clear
                        </Button>
                    </div>
                    <div style={{ marginTop: 8 }}>
                        {recentSearches.slice(0, 5).map((recentSearch) => (
                            <div
                                key={recentSearch.id}
                                style={{
                                    padding: '6px 8px',
                                    cursor: 'pointer',
                                    borderRadius: 4,
                                    marginBottom: 2,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                                className="search-recent-item"
                                onClick={() => handleRecentSearchClick(recentSearch)}
                            >
                                <div>
                                    <ClockCircleOutlined style={{ marginRight: 8, color: '#999' }} />
                                    {recentSearch.query}
                                </div>
                                <Tag color={recentSearch.resultsCount > 0 ? 'green' : 'red'}>
                                    {recentSearch.resultsCount} results
                                </Tag>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {(!suggestions.length && (!recentSearches || recentSearches.length === 0)) && (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <Text type="secondary">Start typing to search...</Text>
                </div>
            )}

            {/* Keyboard shortcut hint */}
            <div style={{
                padding: '8px 12px',
                borderTop: '1px solid #f0f0f0',
                backgroundColor: '#fafafa'
            }}>
                <Text type="secondary" style={{ fontSize: '11px' }}>
                    Press <Tag>Ctrl+K</Tag> to focus search
                </Text>
            </div>
        </div>
    );

    return (
        <Dropdown
            dropdownRender={() => dropdownContent}
            open={isDropdownVisible}
            onOpenChange={setIsDropdownVisible}
            trigger={['click']}
            placement="bottomLeft"
        >
            <Input
                ref={inputRef}
                size={size}
                placeholder={placeholder}
                prefix={<SearchOutlined />}
                value={searchValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onPressEnter={() => handleSearch(searchValue)}
                onFocus={() => setIsDropdownVisible(true)}
                style={{
                    borderRadius: 20,
                    ...style,
                }}
                suffix={
                    <Space>
                        {searchValue && (
                            <Button
                                type="text"
                                size="small"
                                icon={<ClearOutlined />}
                                onClick={() => {
                                    setSearchValue('');
                                    setIsDropdownVisible(false);
                                }}
                                style={{ fontSize: '12px' }}
                            />
                        )}
                    </Space>
                }
            />
        </Dropdown>
    );
};

// Add CSS for hover effects
const styles = `
.search-suggestion-item:hover,
.search-recent-item:hover {
    background-color: #f5f5f5;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}