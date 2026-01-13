'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      if (query) {
        try {
          const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}&limit=50`);
          const data = await res.json();
          setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Search error", error);
        }
      } else {
        setProducts([]);
      }
      setIsLoading(false);
    };

    fetchResults();
  }, [query]);

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-primary mb-2">Kết quả tìm kiếm</h1>
        <p className="text-gray-500">
           {isLoading ? 'Đang tìm kiếm...' : `Tìm thấy ${products.length} kết quả cho "${query || ''}"`}
        </p>
      </div>

      {isLoading ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
               <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse rounded-sm"></div>
            ))}
         </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {products.map((product) => (
            <Link key={product.id} href={`/${product.slug}`} className="group cursor-pointer block">
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 rounded-sm mb-4">
                <Image
                  src={product.image || '/placeholder.png'}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <button 
                  className="absolute bottom-4 right-4 bg-white text-primary p-3 rounded-full shadow-lg translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-accent hover:text-white"
                >
                  <Plus size={20} />
                </button>
              </div>
              <h3 className="text-lg font-medium text-primary mb-1 group-hover:text-accent transition-colors">{product.name}</h3>
              <div className="flex items-baseline gap-2">
                 {product.sale_price ? (
                    <>
                       <span className="text-primary font-bold">{Math.floor(product.sale_price).toLocaleString('vi-VN')}đ</span>
                       <span className="text-gray-400 text-sm line-through">{Math.floor(product.price).toLocaleString('vi-VN')}đ</span>
                    </>
                 ) : (
                    <span className="text-primary font-bold">{Math.floor(product.price).toLocaleString('vi-VN')}đ</span>
                 )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
         <div className="text-center py-20 bg-gray-50 rounded-lg">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm nào</h3>
            <p className="text-gray-500 mb-6">Thử tìm kiếm với từ khóa khác</p>
            <Link href="/" className="inline-block px-6 py-2 bg-primary text-white rounded-full hover:bg-accent transition-colors">
               Về trang chủ
            </Link>
         </div>
      )}
    </div>
  );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="container mx-auto px-6 py-12 text-center">Loading...</div>}>
            <SearchContent />
        </Suspense>
    )
}
