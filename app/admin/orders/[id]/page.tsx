
'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, MapPin, Phone, Mail, User, CreditCard, ShoppingBag, RefreshCw } from 'lucide-react';
import { ORDER_STATUSES } from '@/lib/constants';

interface OrderItem {
    id: number;
    product_name: string;
    product_image: string;
    quantity: number;
    price: number;
}

interface Order {
    id: number;
    code: string;
    status: string;
    created_at: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    note: string;
    amount: number;
    discount: number;
    shipping_fee: number;
    promotion_code: string | null;
    items: OrderItem[];
    promotion_details?: any;
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    async function fetchOrder() {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/orders/${id}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data.order);
            } else {
                notFound();
            }
        } catch (error) {
            console.error('Failed to fetch order', error);
        } finally {
            setLoading(false);
        }
    }

    async function updateStatus(newStatus: string) {
        setUpdating(true);
        try {
            const res = await fetch(`/api/admin/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                fetchOrder(); // Reload
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to update status', error);
        } finally {
            setUpdating(false);
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(price).replace('₫', 'đ');
    };



// ...

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-blue-50 text-blue-700';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'ready_to_ship': return 'bg-indigo-100 text-indigo-800';
            case 'delivering': return 'bg-purple-100 text-purple-800';
            case 'finished': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'request_refund': return 'bg-orange-100 text-orange-800';
            case 'refunded': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const statusOptions = Object.entries(ORDER_STATUSES)
        .filter(([key]) => key !== 'all')
        .map(([key, label]) => ({
            value: key,
            label: label
        }));

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải thông tin đơn hàng...</div>;
    if (!order) return <div className="p-8 text-center text-gray-500">Không tìm thấy đơn hàng</div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/admin/orders" className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            Đơn hàng #{order.code}
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                                {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] || order.status}
                            </span>
                        </h1>
                        <div className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                            <Clock size={14} />
                            {new Date(order.created_at).toLocaleString('vi-VN')}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-lg border shadow-sm">
                    <span className="text-sm font-medium text-gray-700 ml-2">Cập nhật trạng thái:</span>
                    <select 
                        value={order.status}
                        onChange={(e) => updateStatus(e.target.value)}
                        disabled={updating}
                        className="border-gray-300 border rounded-md text-sm py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    {updating && <RefreshCw className="animate-spin text-blue-500" size={16} />}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Order Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Items */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                             <ShoppingBag size={18} className="text-gray-500" />
                             <h3 className="font-semibold text-gray-700">Sản phẩm</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {order.items.map((item) => (
                                <div key={item.id} className="p-4 flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                                        {item.product_image ? (
                                            <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 line-clamp-2">{item.product_name}</h4>
                                        <div className="text-sm text-gray-500 mt-1">x {item.quantity}</div>
                                    </div>
                                    <div className="text-right font-medium text-gray-900">
                                        {formatPrice(item.price)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                             <CreditCard size={18} className="text-gray-500" />
                             <h3 className="font-semibold text-gray-700">Thanh toán</h3>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Tạm tính</span>
                                <span>{formatPrice(order.items.reduce((acc, item) => acc + item.price * item.quantity, 0))}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Phí vận chuyển</span>
                                <span>{formatPrice(order.shipping_fee || 0)}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                                <span>Giảm giá (Voucher)</span>
                                <span>-{formatPrice(order.discount)}</span>
                            </div>
                            {order.promotion_code && (
                                <div className="text-xs text-gray-400 text-right -mt-2">
                                    Mã: {order.promotion_code}
                                </div>
                            )}
                            <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-lg text-gray-900">
                                <span>Tổng cộng</span>
                                <span>{formatPrice(order.amount)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Customer Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                         <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                             <User size={18} className="text-gray-500" />
                             <h3 className="font-semibold text-gray-700">Khách hàng</h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 font-medium uppercase">Họ tên</label>
                                <div className="font-medium">{order.name}</div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-medium uppercase">Email</label>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Mail size={14} />
                                    {order.email}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-medium uppercase">Số điện thoại</label>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Phone size={14} />
                                    {order.phone}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                         <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                             <MapPin size={18} className="text-gray-500" />
                             <h3 className="font-semibold text-gray-700">Địa chỉ giao hàng</h3>
                        </div>
                        <div className="p-4">
                            <p className="text-gray-700 leading-relaxed">
                                {order.address}
                            </p>
                            {/* Assuming address includes province/district/commune or handled separately. For now just raw address string + note */}
                        </div>
                    </div>

                    {order.note && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50">
                                <h3 className="font-semibold text-gray-700">Ghi chú</h3>
                            </div>
                            <div className="p-4 text-gray-600 italic text-sm">
                                "{order.note}"
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
