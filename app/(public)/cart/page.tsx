'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null); // itemId
  const { fetchCartCount } = useAuth();

  const fetchCartItems = async () => {
    try {
      const res = await fetch('/api/cart?detail=true');
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdating(itemId);
    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity: newQuantity }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
        fetchCartCount();
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: number) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) return;
    setUpdating(itemId);
    try {
        const res = await fetch('/api/cart', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId }),
        });
        if (res.ok) {
            setItems((prev) => prev.filter((item) => item.id !== itemId));
            fetchCartCount();
        }
    } catch (error) {
        console.error('Failed to delete item:', error);
    } finally {
        setUpdating(null);
    }
  };

  // Helper to format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price).replace('₫', 'đ');
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => {
        const price = item.sale_price || item.price;
        return total + price * item.quantity;
    }, 0);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
        <div className="container mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
            <h1 className="text-3xl font-display font-medium mb-4">Giỏ hàng của bạn đang trống</h1>
            <p className="text-gray-600 mb-8">Hãy khám phá thêm các sản phẩm tuyệt vời của chúng tôi.</p>
            <Link href="/" className="bg-primary text-white px-8 py-3 rounded-full hover:bg-accent transition-colors">
                Tiếp tục mua sắm
            </Link>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-display font-medium mb-8 text-center md:text-left">Giỏ Hàng</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items List */}
        <div className="flex-1">
          <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b text-gray-500 text-sm font-medium">
            <div className="col-span-6">SẢN PHẨM</div>
            <div className="col-span-2 text-center">GIÁ</div>
            <div className="col-span-2 text-center">SỐ LƯỢNG</div>
            <div className="col-span-2 text-right">TỔNG</div>
          </div>

          <div className="divide-y">
            {items.map((item) => {
                const currentPrice = item.sale_price || item.price;
                return (
                    <div key={item.id} className="py-6 flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                        {/* Product Info */}
                        <div className="col-span-6 flex items-center gap-4 w-full">
                             <div className="relative w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {item.image ? (
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                                )}
                            </div>
                            <div className="flex-1">
                                <Link href={`/${item.slug}`} className="font-medium hover:text-accent transition-colors block mb-1">
                                    {item.name}
                                </Link>
                                <button 
                                    onClick={() => removeItem(item.id)}
                                    className="text-red-500 text-sm flex items-center gap-1 hover:underline disabled:opacity-50"
                                    disabled={updating === item.id}
                                >
                                    <Trash2 size={14} /> Xóa
                                </button>
                            </div>
                        </div>

                         {/* Price (Mobile: hidden, handled in summary or inline) */}
                         <div className="col-span-2 text-center hidden md:block">
                            {formatPrice(currentPrice)}
                         </div>

                         {/* Quantity */}
                         <div className="col-span-2 flex justify-center w-full md:w-auto mt-4 md:mt-0">
                            <div className="flex items-center border rounded-full px-4 py-1 gap-4">
                                <button 
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="text-gray-500 hover:text-black disabled:opacity-30"
                                    disabled={item.quantity <= 1 || updating === item.id}
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="font-medium min-w-[20px] text-center">{item.quantity}</span>
                                <button 
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="text-gray-500 hover:text-black disabled:opacity-30"
                                    disabled={updating === item.id}
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                         </div>

                         {/* Total (Line Item) */}
                         <div className="col-span-2 text-right font-medium text-lg w-full md:w-auto mt-2 md:mt-0 flex justify-between md:block">
                            <span className="md:hidden text-gray-500">Thành tiền:</span>
                            {formatPrice(currentPrice * item.quantity)}
                         </div>
                    </div>
                );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-96">
            <div className="bg-gray-50 p-6 rounded-2xl sticky top-24">
                <h2 className="text-xl font-display font-medium mb-6">Tổng đơn hàng</h2>
                <div className="flex justify-between mb-4 pb-4 border-b">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-medium">{formatPrice(calculateSubtotal())}</span>
                </div>
                {/* Could add shipping calculation here later */}
                <div className="flex justify-between mb-8 text-lg font-bold">
                    <span>Tổng cộng</span>
                    <span>{formatPrice(calculateSubtotal())}</span>
                </div>
                
                <Link href="/checkout" className="w-full bg-primary text-white py-4 rounded-full font-medium hover:bg-accent hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
                    Tiến hành thanh toán <ArrowRight size={18} />
                </Link>

                 <div className="mt-4 text-center">
                    <Link href="/" className="text-sm text-gray-500 hover:text-black underline">
                        Tiếp tục mua sắm
                    </Link>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
}
