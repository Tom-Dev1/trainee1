import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import { useNavigate } from 'react-router-dom';
import { NavigationMenu } from '../NavigationMenu';
import { fetchCategories } from '../../data/mockCategories';
import type { Category } from '../../types';

const { Sider } = Layout;

interface SidebarProps {
    collapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                setLoading(true);
                const data = await fetchCategories();
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            } finally {
                setLoading(false);
            }
        };

        loadCategories();
    }, []);

    const handleCategoryAction = (
        action: 'view' | 'add' | 'update' | 'delete',
        category: Category
    ) => {
        switch (action) {
            case 'view':
                // Navigate directly to category detail page
                navigate(`/categories/${category.slug}`);
                break;
            case 'add':
                navigate(`/category?action=add&parentId=${category.id}`);
                break;
            case 'update':
                navigate(`/category?action=edit&categoryId=${category.id}`);
                break;
            case 'delete':
                // Handle delete (could show modal)
                console.log('Delete category:', category.id);
                break;
        }
    };

    const handleStaticAction = (action: string, path: string) => {
        switch (action) {
            case 'view':
                navigate(path);
                break;
            case 'add':
                if (path === '/products') {
                    navigate('/products?action=add');
                } else if (path === '/category') {
                    navigate('/category?action=add');
                }
                break;
            case 'edit':
                if (path === '/profile') {
                    navigate('/profile?action=edit');
                }
                break;
            case 'refresh':
                // Refresh current page
                window.location.reload();
                break;
        }
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

            <NavigationMenu
                categories={categories}
                loading={loading}
                onCategoryAction={handleCategoryAction}
                onStaticAction={handleStaticAction}
            />
        </Sider>
    );
};