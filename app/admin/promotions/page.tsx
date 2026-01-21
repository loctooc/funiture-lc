
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Edit, Trash2, ChevronLeft, ChevronRight, TicketPercent } from 'lucide-react';

interface Promotion {
    id: number;
    code: string;
    discount: number;
    type: 'percent' | 'fixed';
    number_uses: number;
    limit: number;
    expired_time: string | null;
    status: string;
}

export default function AdminPromotionsPage() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchPromotions();
    }, [page, debouncedSearch]);

    async function fetchPromotions() {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                search: debouncedSearch
            });
            const res = await fetch(`/api/admin/promotions?${params}`);
            if (res.ok) {
                const data = await res.json();
                setPromotions(data.promotions);
                setTotalPages(data.totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch promotions', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) return;
        
        try {
            const res = await fetch(`/api/admin/promotions/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchPromotions();
            } else {
                alert('Không thể xóa mã giảm giá');
            }
        } catch (error) {
            console.error('Failed to delete promotion', error);
            alert('Lỗi hệ thống');
        }
    }

    const formatCurrentcy = (val: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(val).replace('₫', 'đ');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Mã giảm giá</h1>
                <Link 
                    href="/admin/promotions/create" 
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2 font-medium"
                >
                    <Plus size={20} />
                    Tạo mới
                </Link>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm mã giảm giá..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Mã code</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Giảm giá</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Lượt dùng</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Hết hạn</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Đang tải...</td></tr>
                            ) : promotions.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Không có mã giảm giá nào</td></tr>
                            ) : (
                                promotions.map((promo) => (
                                    <tr key={promo.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <div className="flex items-center gap-2">
                                                <TicketPercent size={16} className="text-gray-400" />
                                                {promo.code}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {promo.type === 'percent' ? `${Number(promo.discount)}%` : formatCurrentcy(promo.discount)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {promo.number_uses} / {promo.limit || '∞'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {promo.expired_time ? new Date(promo.expired_time).toLocaleDateString('vi-VN') : 'Không thời hạn'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                promo.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {promo.status === 'active' ? 'Đang hoạt động' : 'Tạm dừng'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <Link href={`/admin/promotions/${promo.id}`} className="text-blue-600 hover:text-blue-900 px-2">
                                                <Edit size={16} className="inline" />
                                            </Link>
                                            <button onClick={() => handleDelete(promo.id)} className="text-red-600 hover:text-red-900 px-2">
                                                <Trash2 size={16} className="inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Simplified) */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                    <div className="text-sm text-gray-500">Trang {page} / {totalPages}</div>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border rounded hover:bg-white disabled:opacity-50">
                            <ChevronLeft size={16} />
                        </button>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 border rounded hover:bg-white disabled:opacity-50">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
