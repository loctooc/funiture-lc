
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface PromotionFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function PromotionForm({ initialData, isEditing = false }: PromotionFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        code: initialData?.code || '',
        discount: initialData?.discount || 0,
        type: initialData?.type || 'percent',
        min_amount: initialData?.min_amount || 0,
        max_amount: initialData?.max_amount || 0,
        limit: initialData?.limit || 0,
        number_product: initialData?.number_product || 0,
        is_free_ship: initialData?.is_free_ship || false,
        expired_time: initialData?.expired_time ? new Date(initialData.expired_time).toISOString().split('T')[0] : '',
        status: initialData?.status || 'active'
    });

    const showError = (msg: string) => {
        setError(msg);
        setTimeout(() => setError(null), 2000);
    };

    const formatNumber = (val: number | string) => {
        if (!val) return '';
        const num = Number(val);
        if (isNaN(num)) return val.toString();
        // Return integer string with dots
        return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(num).replace(/\./g, '.');
    };

    const parseNumber = (val: string) => {
        return Number(val.replace(/\./g, ''));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
             setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else if (name === 'discount' || name === 'min_amount' || name === 'max_amount' || name === 'limit' || name === 'number_product') {
            // Handle number input with text type
            const rawValue = value.replace(/\./g, '');
            if (!/^\d*$/.test(rawValue)) return; // Only allow digits
            setFormData(prev => ({ ...prev, [name]: Number(rawValue) }));
        } else {
             setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Custom Validation
        if (!formData.code.trim()) {
            showError('Vui lòng nhập mã code');
            setLoading(false);
            return;
        }

        if (formData.discount <= 0) {
            showError('Giá trị giảm giá phải lớn hơn 0');
            setLoading(false);
            return;
        }

        if (formData.type === 'percent' && (formData.discount < 1 || formData.discount > 99)) {
            showError('Giá trị phần trăm giảm giá phải từ 1 đến 99');
            setLoading(false);
            return;
        }

        try {
            const url = isEditing 
                ? `/api/admin/promotions/${initialData.id}`
                : '/api/admin/promotions';
            
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/admin/promotions');
                router.refresh();
            } else {
                showError(data.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Submit error:', error);
            showError('Lỗi hệ thống');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6 relative">
            {/* Error Toast */}
            {error && (
                <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-down">
                    {error}
                </div>
            )}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/admin/promotions" className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {isEditing ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}
                    </h1>
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2 font-medium disabled:opacity-50"
                >
                    <Save size={20} />
                    {loading ? 'Đang lưu...' : 'Lưu lại'}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Code */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã Code <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            name="code"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 uppercase"
                            value={formData.code}
                            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase().replace(/\s/g, '') }))}
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                        <select 
                            name="status"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="active">Hoạt động</option>
                            <option value="pending">Tạm dừng</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Loại giảm giá</label>
                        <select 
                            name="type"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={formData.type}
                            onChange={handleChange}
                        >
                            <option value="percent">Theo phần trăm (%)</option>
                            <option value="fixed">Số tiền cố định (VNĐ)</option>
                        </select>
                    </div>

                    {/* Discount Value */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Giá trị giảm {formData.type === 'percent' ? '(%)' : '(VNĐ)'} <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            name="discount"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={formatNumber(formData.discount)}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {formData.type === 'percent' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giảm tối đa (VNĐ)</label>
                        <input 
                            type="text" 
                            name="max_amount"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={formatNumber(formData.max_amount)}
                            onChange={handleChange}
                        />
                        <p className="text-xs text-gray-500 mt-1">Để 0 nếu không giới hạn</p>
                    </div>
                )}

                <div className="border-t border-gray-100 pt-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Điều kiện áp dụng</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Đơn hàng tối thiểu (VNĐ)</label>
                            <input 
                                type="text" 
                                name="min_amount"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={formatNumber(formData.min_amount)}
                                onChange={handleChange}
                            />
                        </div>

                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng sản phẩm tối thiểu</label>
                            <input 
                                type="text" 
                                name="number_product"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={formatNumber(formData.number_product)}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giới hạn số lần sử dụng</label>
                            <input 
                                type="text" 
                                name="limit"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={formatNumber(formData.limit)}
                                onChange={handleChange}
                            />
                            <p className="text-xs text-gray-500 mt-1">Để 0 nếu không giới hạn</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hết hạn</label>
                            <input 
                                type="date" 
                                name="expired_time"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={formData.expired_time}
                                onChange={(e) => setFormData(prev => ({ ...prev, expired_time: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                         <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox"
                                name="is_free_ship"
                                checked={formData.is_free_ship}
                                onChange={handleChange}
                                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                            />
                            <span className="text-gray-700 font-medium select-none">Miễn phí vận chuyển</span>
                        </label>
                    </div>
                </div>
            </div>
        </form>
    );
}
