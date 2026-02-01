'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface QuickAddButtonProps {
  productId: number;
  inventory: number;
}

export default function QuickAddButton({ productId, inventory }: QuickAddButtonProps) {
  const [loading, setLoading] = useState(false);
  const { fetchCartCount } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if inside a Link
    e.stopPropagation(); // Stop event bubbling

    if (inventory <= 0) return;

    setLoading(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (res.ok) {
        await fetchCartCount();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        // Handle error silently or with a toast if needed
        console.error("Failed to add to cart");
      }
    } catch (e) {
      console.error("Connection error", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
        <button 
          className="absolute bottom-4 right-4 bg-white text-primary p-3 rounded-full shadow-lg translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-accent hover:text-white"
          aria-label="Add to Cart"
          onClick={handleAddToCart}
          disabled={loading || inventory <= 0}
        >
          {loading ? (
             <span className="block w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
          ) : (
             <ShoppingCart size={20} />
          )}
        </button>
        
        {/* Success Message Toast */}
        <div className={`absolute bottom-20 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded shadow-md transition-all duration-300 ${showSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
           Added to Cart!
        </div>
    </>
  );
}
