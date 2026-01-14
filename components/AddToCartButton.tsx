
'use client';

import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AddToCartButtonProps {
  productId: number;
  inventory: number;
}

export default function AddToCartButton({ productId, inventory }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const { fetchCartCount } = useAuth();
  const [message, setMessage] = useState('');

  const handleAddToCart = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (res.ok) {
        await fetchCartCount();
        setMessage('Đã thêm vào giỏ hàng!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Lỗi khi thêm vào giỏ');
      }
    } catch (e) {
      setMessage('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
        <button 
            className="w-full bg-primary text-white py-4 rounded-full font-medium hover:bg-accent hover:text-white transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed relative"
            disabled={inventory <= 0 || loading}
            onClick={handleAddToCart}
        >
            {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
                <>
                    <ShoppingBag size={20} />
                    <span>Thêm vào giỏ</span>
                </>
            )}
        </button>
        {message && <p className="text-center text-sm mt-2 text-green-600 font-medium">{message}</p>}
    </div>
  );
}
