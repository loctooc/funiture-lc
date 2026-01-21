'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { Ticket, X } from 'lucide-react';
import VoucherModal from '@/components/VoucherModal';

interface Location {
  id: number;
  name: string;
}

interface CartItem {
    id: number;
    product_id: number;
    name: string;
    slug: string;
    image: string;
    price: number;
    sale_price: number | null;
    quantity: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, fetchCartCount } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    province_id: '',
    district_id: '',
    commune_id: '', // ward/commune
    note: ''
  });

  const [provinces, setProvinces] = useState<Location[]>([]);
  const [districts, setDistricts] = useState<Location[]>([]);
  const [wards, setWards] = useState<Location[]>([]);
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Voucher State
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{code: string, discount: number} | null>(null);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  // Load Cart
  useEffect(() => {
    async function fetchCart() {
        try {
            const res = await fetch('/api/cart?detail=true');
            const data = await res.json();
            if (data.items && data.items.length > 0) {
                setCartItems(data.items);
            } else {
                router.push('/cart'); // Redirect if empty
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }
    fetchCart();
  }, [router]);

  // Load User Data
  useEffect(() => {
    if (user) {
        setFormData(prev => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '', 
        }));
    }
  }, [user]);

  // Load Provinces
  useEffect(() => {
    async function fetchProvinces() {
        const res = await fetch('/api/locations');
        const data = await res.json();
        setProvinces(data);
    }
    fetchProvinces();
  }, []);

  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
        setNotification(null);
    }, 2000);
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Vui lòng nhập họ tên';
    if (!formData.phone) newErrors.phone = 'Vui lòng nhập số điện thoại';
    // Basic phone regex could be added: /^[0-9]{10,11}$/
    if (!formData.province_id) newErrors.province_id = 'Vui lòng chọn Tỉnh/Thành';
    if (!formData.district_id) newErrors.district_id = 'Vui lòng chọn Quận/Huyện';
    if (!formData.commune_id) newErrors.commune_id = 'Vui lòng chọn Phường/Xã';
    if (!formData.address) newErrors.address = 'Vui lòng nhập địa chỉ';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user types
    if (errors[e.target.name]) {
        setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  // Need to redefine handleProvinceChange to clear errors
  const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const parentId = e.target.value;
    setFormData({ ...formData, province_id: parentId, district_id: '', commune_id: '' });
    
    // Clear errors
    const newErrors = { ...errors };
    delete newErrors.province_id;
    delete newErrors.district_id;
    delete newErrors.commune_id;
    setErrors(newErrors);
    
    setDistricts([]);
    setWards([]);
    
    if (parentId) {
        const res = await fetch(`/api/locations?parent_id=${parentId}`);
        const data = await res.json();
        setDistricts(data);
    }
  };

  const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const parentId = e.target.value;
    setFormData({ ...formData, district_id: parentId, commune_id: '' });
    
    // Clear errors
    const newErrors = { ...errors };
    delete newErrors.district_id;
    delete newErrors.commune_id;
    setErrors(newErrors);

    setWards([]);

    if (parentId) {
        const res = await fetch(`/api/locations?parent_id=${parentId}`);
        const data = await res.json();
        setWards(data);
    }
  };


  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
        const price = item.sale_price || item.price;
        return total + price * item.quantity;
    }, 0);
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price).replace('₫', 'đ');
  };

  const handleApplyVoucher = async () => {
      if (!voucherCode) return;
      setIsValidatingVoucher(true);
      try {
          const res = await fetch('/api/promotions/validate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: voucherCode, totalAmount: calculateTotal() }),
          });
          const data = await res.json();
          if (res.ok && data.valid) {
              setAppliedVoucher({ code: voucherCode, discount: data.discount });
              showNotification(data.message, 'success');
              setIsVoucherModalOpen(false); // Close modal if open
          } else {
              showNotification(data.message || 'Mã giảm giá không hợp lệ', 'error');
              setAppliedVoucher(null);
          }
      } catch (error) {
          console.error(error);
          showNotification('Lỗi khi kiểm tra mã', 'error');
      } finally {
          setIsValidatingVoucher(false);
      }
  };
  
  // When selecting from modal, set code and auto apply
  const handleSelectVoucher = (code: string) => {
      setVoucherCode(code);
      // We can't immediately call handleApplyVoucher because state update is async, 
      // but we can call duplicate logic or use useEffect. 
      // For simplicity, let's just trigger logic with the code directly.
      validateVoucherDirectly(code);
  };

  const validateVoucherDirectly = async (code: string) => {
      setIsValidatingVoucher(true);
      try {
          const res = await fetch('/api/promotions/validate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: code, totalAmount: calculateTotal() }),
          });
          const data = await res.json();
          if (res.ok && data.valid) {
              setAppliedVoucher({ code: code, discount: data.discount });
              setVoucherCode(code); // Ensure input shows code
              showNotification(data.message, 'success');
              setIsVoucherModalOpen(false);
          } else {
              showNotification(data.message || 'Mã giảm giá không hợp lệ', 'error');
              setAppliedVoucher(null);
          }
      } catch (error) {
          console.error(error);
          showNotification('Lỗi khi kiểm tra mã', 'error');
      } finally {
          setIsValidatingVoucher(false);
      }
  }

  const handleRemoveVoucher = () => {
      setAppliedVoucher(null);
      setVoucherCode('');
      showNotification('Đã gỡ bỏ mã giảm giá', 'success');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
        showNotification('Vui lòng kiểm tra lại thông tin', 'error');
        return;
    }

    setSubmitting(true);
    try {
        const payload = {
            ...formData,
            promotion_code: appliedVoucher ? appliedVoucher.code : null
        };

        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        
        const data = await res.json();
        if (res.ok) {
            showNotification(`Đặt hàng thành công! Mã đơn hàng: ${data.orderCode}`, 'success');
            fetchCartCount(); // Update badge
            setTimeout(() => {
                 router.push('/'); 
            }, 2000); // Wait for notification
        } else {
            showNotification(data.message || 'Có lỗi xảy ra', 'error');
        }
    } catch (error) {
        console.error(error);
        showNotification('Lỗi kết nối', 'error');
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) {
     return <div className="text-center py-20">Loading...</div>;
  }

  const finalTotal = calculateTotal() - (appliedVoucher?.discount || 0);

  return (
    <div className="container mx-auto px-4 py-12 relative">
      <h1 className="text-3xl font-display font-medium mb-8 text-center">Thanh Toán</h1>
      
      <VoucherModal 
        isOpen={isVoucherModalOpen} 
        onClose={() => setIsVoucherModalOpen(false)} 
        onSelect={handleSelectVoucher}
        cartTotal={calculateTotal()}
      />

      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-24 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium animate-fade-in ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {notification.message}
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Checkout Form */}
        <div className="flex-1">
            <h2 className="text-xl font-medium mb-6">Thông tin giao hàng</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Họ và tên *</label>
                        <input 
                            type="text" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange}
                            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-primary ${errors.name ? 'border-red-500' : ''}`}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Số điện thoại *</label>
                        <input 
                            type="tel" 
                            name="phone" 
                            value={formData.phone} 
                            onChange={handleChange}
                            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-primary ${errors.phone ? 'border-red-500' : ''}`}
                        />
                         {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-gray-600 mb-1">Email</label>
                    <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Tỉnh / Thành phố *</label>
                        <select 
                            name="province_id" 
                            value={formData.province_id} 
                            onChange={handleProvinceChange}
                            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-primary ${errors.province_id ? 'border-red-500' : ''}`}
                        >
                            <option value="">Chọn Tỉnh / Thành</option>
                            {provinces.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        {errors.province_id && <p className="text-red-500 text-xs mt-1">{errors.province_id}</p>}
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Quận / Huyện *</label>
                        <select 
                            name="district_id" 
                            value={formData.district_id} 
                            onChange={handleDistrictChange}
                            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-primary ${errors.district_id ? 'border-red-500' : ''}`}
                            disabled={!formData.province_id}
                        >
                            <option value="">Chọn Quận / Huyện</option>
                            {districts.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                        {errors.district_id && <p className="text-red-500 text-xs mt-1">{errors.district_id}</p>}
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Phường / Xã *</label>
                        <select 
                            name="commune_id" 
                            value={formData.commune_id} 
                            onChange={handleChange}
                            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-primary ${errors.commune_id ? 'border-red-500' : ''}`}
                            disabled={!formData.district_id}
                        >
                            <option value="">Chọn Phường / Xã</option>
                            {wards.map(w => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                        {errors.commune_id && <p className="text-red-500 text-xs mt-1">{errors.commune_id}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-gray-600 mb-1">Địa chỉ cụ thể *</label>
                    <input 
                        type="text" 
                        name="address" 
                        value={formData.address} 
                        onChange={handleChange}
                        placeholder="Số nhà, tên đường..."
                        className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-primary ${errors.address ? 'border-red-500' : ''}`}
                    />
                     {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>

                <div>
                    <label className="block text-sm text-gray-600 mb-1">Ghi chú đơn hàng</label>
                    <textarea 
                        name="note" 
                        value={formData.note}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-primary h-24"
                    ></textarea>
                </div>
            </form>
        </div>

        {/* Order Summary */}
        <div className="lg:w-96">
            <div className="bg-gray-50 p-6 rounded-2xl sticky top-24">
                <h2 className="text-xl font-medium mb-6">Đơn hàng của bạn</h2>
                <div className="space-y-4 max-h-60 overflow-y-auto mb-6 pr-2">
                    {cartItems.map(item => (
                        <div key={item.id} className="flex gap-4">
                             <div className="relative w-16 h-16 bg-white rounded border overflow-hidden flex-shrink-0">
                                {item.image && (
                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                )}
                            </div>
                            <div className="flex-1 text-sm">
                                <p className="font-medium line-clamp-2">{item.name}</p>
                                <div className="flex justify-between text-gray-500 mt-1">
                                    <span>x {item.quantity}</span>
                                    <span>{formatPrice((item.sale_price || item.price) * item.quantity)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Voucher Input */}
                <div className="mb-6 border-t pt-4">
                     <div className="flex gap-2">
                        <div className="relative flex-1">
                             <Ticket size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                             <input 
                                type="text"
                                placeholder="Mã giảm giá"
                                value={voucherCode}
                                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                                disabled={!!appliedVoucher}
                                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-primary"
                             />
                        </div>
                        <button 
                            onClick={handleApplyVoucher}
                            disabled={!voucherCode || isValidatingVoucher || !!appliedVoucher}
                            className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isValidatingVoucher ? '...' : 'Áp dụng'}
                        </button>
                     </div>
                     {!appliedVoucher && (
                         <button 
                            onClick={() => setIsVoucherModalOpen(true)}
                            className="text-primary text-sm font-medium mt-2 hover:underline"
                         >
                            Chọn voucher có sẵn
                         </button>
                     )}
                     
                     {appliedVoucher && (
                         <div className="mt-2 flex justify-between items-center text-sm bg-green-50 text-green-700 px-3 py-2 rounded-lg border border-green-200">
                             <span className="font-medium">Voucher: {appliedVoucher.code}</span>
                             <button onClick={handleRemoveVoucher} className="p-1 hover:bg-green-100 rounded-full">
                                 <X size={14} />
                             </button>
                         </div>
                     )}
                </div>

                <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Tạm tính</span>
                        <span className="font-medium">{formatPrice(calculateTotal())}</span>
                    </div>
                    {appliedVoucher && (
                        <div className="flex justify-between text-green-600">
                            <span>Giảm giá</span>
                            <span className="font-medium">-{formatPrice(appliedVoucher.discount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-gray-600">Phí vận chuyển</span>
                        <span className="font-medium">Chưa tính</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold pt-2 border-t">
                        <span>Tổng cộng</span>
                        <span className="text-primary">{formatPrice(finalTotal)}</span>
                    </div>
                </div>

                <div className="mt-8">
                     <label className="flex items-center gap-2 mb-4">
                        <input type="radio" checked readOnly className="w-4 h-4 text-primary" />
                        <span className="text-sm">Thanh toán khi nhận hàng (COD)</span>
                    </label>

                    <button 
                        onClick={handleSubmit} 
                        className="w-full bg-primary text-white py-4 rounded-full font-medium hover:bg-accent transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                        disabled={submitting}
                    >
                        {submitting ? 'Đang xử lý...' : 'Đặt hàng'}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
