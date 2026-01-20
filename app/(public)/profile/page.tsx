'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { User, Package, MapPin, LogOut, Camera, Edit2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ORDER_STATUSES, OrderStatus } from '@/lib/constants';

interface Order {
  id: number;
  code: string;
  name: string;
  phone: string;
  address: string;
  amount: number;
  status: string;
  created_at: string;
}

export default function ProfilePage() {
  const { user, login, logout, loading: authLoading } = useAuth(); // Assuming login updates the user state or we need a way to refresh user
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [editPhone, setEditPhone] = useState('');
  const [editAvatar, setEditAvatar] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
        router.push('/login');
    } else if (user) {
        setEditPhone(user.phone || '');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchOrders() {
        if (!user) return;
        try {
            const res = await fetch('/api/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders);
            }
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoadingOrders(false);
        }
    }
    fetchOrders();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price).replace('₫', 'đ');
  };

  const getStatusColor = (status: string) => {
      switch (status) {
          case 'pending': return 'bg-yellow-100 text-yellow-800';
          case 'confirmed': return 'bg-blue-100 text-blue-800';
          case 'processing': return 'bg-indigo-100 text-indigo-800';
          case 'ready_to_ship': return 'bg-purple-100 text-purple-800';
          case 'delivering': return 'bg-orange-100 text-orange-800';
          case 'finished': return 'bg-green-100 text-green-800';
          case 'request_refund': return 'bg-pink-100 text-pink-800';
          case 'refunded': return 'bg-gray-100 text-gray-800';
          case 'cancelled': return 'bg-red-100 text-red-800';
          default: return 'bg-gray-100 text-gray-800';
      }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setEditAvatar(file);
        setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async () => {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('phone', editPhone);
      if (editAvatar) {
          formData.append('avatar', editAvatar);
      }

      try {
          const res = await fetch('/api/user/update', {
              method: 'PUT',
              body: formData,
          });
          
          if (res.ok) {
              const data = await res.json();
              alert('Cập nhật thành công!');
              setIsEditing(false);
              // Need to update local user state. Ideally AuthContext exposes a refresh or we act like login 
              // For now, simple reload or we can fetch /api/auth/me again but let's assume we need to trigger re-fetch
              window.location.reload(); 
          } else {
              alert('Có lỗi xảy ra when updating profile');
          }
      } catch (error) {
          console.error(error);
          alert('Error connection');
      } finally {
          setIsSaving(false);
      }
  };

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === selectedStatus);

  if (authLoading || !user) {
      return <div className="min-h-[60vh] flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar / Tabs */}
            <div className="lg:w-1/4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                   <div className="p-6 border-b border-gray-100 text-center">
                        <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3 overflow-hidden">
                             {user.avatar ? (
                                 <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                             ) : (
                                 <User size={32} className="text-gray-400" />
                             )}
                        </div>
                        <h2 className="font-bold text-gray-900">{user.name}</h2>
                        <p className="text-sm text-gray-500">{user.email}</p>
                   </div>
                   
                   <nav className="p-2">
                       <button 
                         onClick={() => setActiveTab('profile')}
                         className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${activeTab === 'profile' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                       >
                           <User size={18} /> Thông tin tài khoản
                       </button>
                       <button 
                         onClick={() => setActiveTab('orders')}
                         className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${activeTab === 'orders' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                       >
                           <Package size={18} /> Đơn mua
                       </button>
                   </nav>

                   <div className="p-2 border-t border-gray-100">
                        <button 
                            onClick={() => logout()}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors text-left"
                        >
                            <LogOut size={18} /> Đăng xuất
                        </button>
                   </div>
                </div>
            </div>

            {/* Right Content */}
            <div className="lg:w-3/4">
                {activeTab === 'profile' && (
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Hồ sơ của tôi</h2>
                            {!isEditing && (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 text-primary hover:text-accent font-medium px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors"
                                >
                                    <Edit2 size={16} /> Sửa hồ sơ
                                </button>
                            )}
                        </div>

                        <div className="max-w-xl">
                            <div className="space-y-6">
                                {/* Avatar Upload */}
                                <div className="flex items-center gap-6">
                                    <div className="relative group cursor-pointer" onClick={() => isEditing && fileInputRef.current?.click()}>
                                        <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border-2 border-gray-100 group-hover:border-primary transition-colors">
                                            {previewAvatar || user.avatar ? (
                                                <img src={previewAvatar || user.avatar || ''} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <User size={40} />
                                                </div>
                                            )}
                                        </div>
                                        {isEditing && (
                                            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Camera className="text-white" size={24} />
                                            </div>
                                        )}
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                            accept="image/*" 
                                            onChange={handleAvatarChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        <p>Dụng lượng file tối đa 1 MB</p>
                                        <p>Định dạng: .JPEG, .PNG</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
                                        <input 
                                            type="text" 
                                            value={user.name} 
                                            disabled 
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input 
                                            type="text" 
                                            value={user.email} 
                                            disabled 
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                        <input 
                                            type="text" 
                                            value={isEditing ? editPhone : user.phone || 'Chưa cập nhật'} 
                                            onChange={(e) => setEditPhone(e.target.value)}
                                            disabled={!isEditing}
                                            className={`w-full px-4 py-2 border rounded-lg ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                                            placeholder="Thêm số điện thoại"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo tài khoản</label>
                                        <div className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500">
                                            {formatDate(user.created_at || new Date().toISOString())}
                                        </div>
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex items-center gap-4 pt-4">
                                        <button 
                                            onClick={handleUpdateProfile}
                                            disabled={isSaving}
                                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors disabled:opacity-70"
                                        >
                                            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setIsEditing(false);
                                                setEditPhone(user.phone || '');
                                                setPreviewAvatar(null);
                                                setEditAvatar(null);
                                            }}
                                            disabled={isSaving}
                                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in relative">
                         {/* Order Status Tabs */}
                        <div className="border-b border-gray-100 overflow-x-auto">
                            <div className="flex min-w-max p-2">
                                {(Object.keys(ORDER_STATUSES) as Array<keyof typeof ORDER_STATUSES>).map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setSelectedStatus(status)}
                                        className={`px-4 py-3 text-sm font-medium whitespace-nowrap rounded-lg transition-colors relative ${
                                            selectedStatus === status 
                                            ? 'text-primary bg-primary/5' 
                                            : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                                        }`}
                                    >
                                        {ORDER_STATUSES[status]}
                                        {selectedStatus === status && (
                                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-primary rounded-t-full"></span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-6">
                            {loadingOrders ? (
                                <div className="text-center py-12">
                                    <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-gray-500">Đang tải đơn hàng...</p>
                                </div>
                            ) : filteredOrders.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredOrders.map((order) => (
                                        <div key={order.id} className="border border-gray-100 rounded-xl p-5 hover:border-primary/30 transition-colors">
                                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 pb-4 border-b border-gray-50">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="font-bold text-lg">{order.code}</span>
                                                        <span className="text-sm text-gray-500">{formatDate(order.created_at)}</span>
                                                    </div>
                                                    <div className="text-sm text-gray-600 flex items-center gap-1">
                                                        <MapPin size={14} />
                                                        <span className="truncate max-w-[200px] md:max-w-md" title={order.address}>{order.address}</span>
                                                    </div>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-sm font-medium self-start md:self-center ${getStatusColor(order.status)}`}>
                                                    {ORDER_STATUSES[order.status as OrderStatus] || order.status}
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div className="text-sm text-gray-500">
                                                    Tổng tiền
                                                </div>
                                                <div className="text-xl font-bold text-primary">
                                                    {formatPrice(order.amount)}
                                                </div>
                                            </div>

                                            {/* Order Items */}
                                            <div className="mt-4 pt-4 border-t border-gray-50 space-y-3">
                                                {order.items?.map((item: any) => (
                                                    <div key={item.id} className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-gray-50 rounded border overflow-hidden flex-shrink-0">
                                                            {item.image && (
                                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                                            <p className="text-xs text-gray-500">x{item.quantity}</p>
                                                        </div>
                                                        <div className="text-sm font-medium text-gray-700">
                                                            {formatPrice(item.price)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {/* Action Buttons (Optional) */}
                                            {/* <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-50">
                                                <button className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Xem chi tiết</button>
                                                {order.status === 'pending' && (
                                                    <button className="px-4 py-2 text-sm bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100">Hủy đơn</button>
                                                )}
                                            </div> */}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 flex flex-col items-center">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <Package size={32} className="text-gray-300" />
                                    </div>
                                    <p className="text-gray-500 mb-4">Chưa có đơn hàng nào</p>
                                    <Link href="/" className="px-6 py-2 bg-primary text-white rounded-full hover:bg-accent transition-colors shadow-sm hover:shadow-md">
                                        Mua sắm ngay
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
