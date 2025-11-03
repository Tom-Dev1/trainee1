import React, { useState, useEffect } from 'react';
import { Button, Typography, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { CategoryTree } from '../../components/CategoryTree';
import { CategoryModals } from '../../components/CategoryTree/CategoryModals';
import { useCategories } from '../../hooks/useCategories';


const { Title } = Typography;

export const CategoryList: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [modalType, setModalType] = useState<'add' | null>(null);

    const { data: categories, isLoading } = useCategories();

    // Handle URL-based modal opening
    useEffect(() => {
        const action = searchParams.get('action');
        if (action === 'add') {
            setModalType('add');
        }
    }, [searchParams]);

    const handleAdd = () => {
        setModalType('add');
        setSearchParams({ action: 'add' });
    };

    const closeModal = () => {
        setModalType(null);
        setSearchParams({});
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={2}>Categories</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Add Category
                </Button>
            </div>

            <Card>
                <CategoryTree
                    categories={categories || []}
                    loading={isLoading}
                />
            </Card>

            <CategoryModals
                type={modalType}
                category={null}
                onClose={closeModal}
            />
        </div>
    );
};