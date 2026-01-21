
'use client';

import { use, useState, useEffect } from 'react';
import PromotionForm from '../form';

export default function EditPromotionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [promotion, setPromotion] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPromotion();
    }, [id]);

    async function fetchPromotion() {
        try {
            const res = await fetch(`/api/admin/promotions/${id}`);
            if (res.ok) {
                const data = await res.json();
                setPromotion(data.promotion);
            }
        } catch (error) {
            console.error('Failed to fetch promotion', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải...</div>;
    if (!promotion) return <div className="p-8 text-center text-gray-500">Không tìm thấy mã giảm giá</div>;

    return <PromotionForm initialData={promotion} isEditing />;
}
