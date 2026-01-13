import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/lib/products";
import ProductGallery from "@/components/ProductGallery";
import { ShoppingBag, Star, Check, X } from "lucide-react";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const {slug} = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Combine main image and gallery images for the gallery component
  const images = [product.image, ...product.gallery.map(g => g.image_url)];
  // Remove duplicates if any
  const uniqueImages = Array.from(new Set(images));

  const formatPrice = (price: number) => {
    return Math.floor(price).toLocaleString('vi-VN') + 'đ';
  };

  return (
    <div className="container mx-auto px-6 py-32">
       {/* Breadcrumb */}
       <div className="text-sm text-gray-400 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link> 
          <span>/</span>
          {product.categories.length > 0 && (
             <>
                <span className="text-gray-400">{product.categories[0].name}</span>
                <span>/</span>
             </>
          )}
          <span className="text-primary font-medium">{product.name}</span>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: Gallery */}
          <ProductGallery images={uniqueImages} />

          {/* Right: Info */}
          <div className="flex flex-col h-full">
             <div className="mb-2">
                {product.categories.map(cat => (
                   <span key={cat.id} className="text-accent text-sm font-bold uppercase tracking-widest mr-4">{cat.name}</span>
                ))}
             </div>
             <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">{product.name}</h1>
             
             <div className="flex items-center space-x-4 mb-6">
                <div className="flex text-accent">
                   {[...Array(5)].map((_, i) => (
                      <Star key={i} size={18} fill="currentColor" />
                   ))}
                </div>
                <span className="text-gray-400 text-sm">(12 đánh giá)</span>
             </div>

             <div className="text-3xl font-light text-primary mb-8">
                {product.sale_price ? (
                    <>
                       <span className="line-through text-gray-300 mr-4 text-2xl">{formatPrice(product.price)}</span>
                       <span className="text-red-500 font-medium">{formatPrice(product.sale_price)}</span>
                    </>
                ) : (
                    <span>{formatPrice(product.price)}</span>
                )}
             </div>

             <p className="text-gray-500 leading-relaxed mb-8 border-b border-gray-100 pb-8">
                {product.description}
             </p>

             {/* Actions */}
             <div className="mb-8">
                <div className="flex items-center space-x-4 mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${product.inventory > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.inventory > 0 ? (
                            <><Check size={14} className="mr-1"/> Còn hàng</>
                        ) : (
                            <><X size={14} className="mr-1"/> Hết hàng</>
                        )}
                    </span>
                    <span className="text-sm text-gray-400">SKU: {product.slug}</span>
                </div>
                
                <button 
                  className="w-full bg-primary text-white py-4 rounded-full font-medium hover:bg-accent hover:text-white transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={product.inventory <= 0}
                >
                   <ShoppingBag size={20} />
                   <span>Thêm vào giỏ</span>
                </button>
             </div>

             {/* Accordion / Content placeholder */}
             <div className="mt-auto">
                 <h3 className="font-bold text-primary border-b pb-2 mb-4">Mô tả chi tiết</h3>
                 <div className="prose prose-sm text-gray-500 max-w-none" dangerouslySetInnerHTML={{ __html: product.content || '' }} />
             </div>
          </div>
       </div>
    </div>
  );
}
