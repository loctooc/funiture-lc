'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { ShoppingCart, Trash2 } from 'lucide-react';
import AddToCartButton from '@/components/AddToCartButton'; // Using existing button or custom logic
import QuickAddButton from '@/components/QuickAddButton';

interface Wishproduct {
  wishlist_id: number;
  id: number;
  name: string;
  slug: string;
  image: string;
  price: number;
  sale_price: number | null;
}

export default function WishlistPage() {
  const { user, loading: authLoading, wishlist, fetchWishlist, fetchCartCount } = useAuth();
  const [products, setProducts] = useState<Wishproduct[]>([]);
  const [loading, setLoading] = useState(true);

  const handleMoveToCart = async (product: Wishproduct) => {
      try {
        const res = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: product.id, quantity: 1 }),
        });
        if (res.ok) {
            await fetchCartCount();
            await handleRemove(product.id);
        }
      } catch(e) {
        console.error(e);
      }
  };

  useEffect(() => {
    if (!authLoading && !user) {
       // Redirect or show message handled by UI state
    }
  }, [authLoading, user]);

  useEffect(() => {
    const fetchDetailedWishlist = async () => {
      try {
        const res = await fetch('/api/wishlist?detail=true');
        if (res.ok) {
           const data = await res.json();
           setProducts(data.items);
        }
      } catch (error) {
        console.error("Failed to fetch wishlist details");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
       fetchDetailedWishlist();
    } else if (!authLoading) {
       setLoading(false);
    }
  }, [user, authLoading, wishlist]); // Re-fetch if wishlist count changes (controlled by context)

  const handleRemove = async (productId: number) => {
    // We can use the context function, but we might want to update local state optimistically
    // actually context's toggleWishlist will refresh the context state, which triggers the useEffect above
    // so we can just use the context function or call API directly.
    // However, context `toggleWishlist` calls `fetchWishlist` (IDs only). 
    // To update the detailed list here, we rely on the useEffect dependency on `wishlist`? 
    // `wishlist` is just IDs. If I remove an ID, `wishlist` changes, effect runs, fetches details again.
    // Slightly inefficient but correct.
    
    // Better: call API to remove, then update local state + context
    const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
    });
    if (res.ok) {
        fetchWishlist(); // Update context items count
        // Optimistic update
        setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  if (authLoading || loading) {
    return (
        <div className="min-h-screen pt-32 pb-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
  }

  if (!user) {
     return (
        <div className="min-h-screen pt-32 pb-20 container mx-auto px-6 text-center">
            <h1 className="text-3xl font-serif font-bold mb-4">My Wishlist</h1>
            <p className="text-gray-500 mb-8">Please login to view your wishlist.</p>
            <Link href="/login" className="bg-primary text-white px-8 py-3 rounded-full hover:bg-accent transition-colors">
                Login Now
            </Link>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-secondary/20 pt-32 pb-20">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-center mb-12">My Wishlist</h1>

        {products.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map(product => (
                 <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden group">
                    <div className="relative aspect-[3/4] bg-gray-100">
                        <Image 
                           src={product.image || '/placeholder.png'}
                           alt={product.name}
                           fill
                           className="object-cover"
                        />
                        <button 
                            onClick={() => handleRemove(product.id)}
                            className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-gray-400 hover:text-red-500 transition-colors shadow-sm"
                            title="Remove from wishlist"
                        >
                            <Trash2 size={18} />
                        </button>
                        
                        {/* Quick Add Overlay */}
                        <div className="absolute bottom-4 right-4 translate-y-full opacity-0 group-hover:0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                           {/* QuickAddButton expects inventory, assume 10 for now or fetch in detail */}
                           {/* Since we didn't fetch inventory in the basic query, we'll skip the quick add logic or use a simple link */}
                        </div>
                    </div>
                    
                    <div className="p-4">
                        <Link href={`/${product.slug}`}>
                            <h3 className="text-lg font-medium text-primary mb-2 hover:text-accent transition-colors truncate">{product.name}</h3>
                        </Link>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-red-500 font-bold">
                                {Math.floor(product.sale_price || product.price).toLocaleString('vi-VN')}đ
                            </span>
                            {product.sale_price && (
                                <span className="text-sm text-gray-400 line-through">
                                    {Math.floor(product.price).toLocaleString('vi-VN')}đ
                                </span>
                            )}
                        </div>
                        <button 
                            onClick={() => handleMoveToCart(product)}
                            className="block w-full text-center bg-primary text-white py-2 rounded-lg hover:bg-accent transition-colors flex justify-center items-center gap-2"
                        >
                            <ShoppingCart size={16} />
                            Add to Cart
                        </button>
                    </div>
                 </div>
              ))}
           </div>
        ) : (
           <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                   <HeartIcon size={32} />
               </div>
               <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
               <p className="text-gray-500 mb-8 max-w-md mx-auto">Start exploring our collection and save your favorite items here.</p>
               <Link href="/shop" className="bg-primary text-white px-8 py-3 rounded-full hover:bg-accent transition-colors">
                   Explore Shop
               </Link>
           </div>
        )}
      </div>
    </div>
  );
}

function HeartIcon({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
    )
}
