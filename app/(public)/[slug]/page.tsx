import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProductBySlug } from "@/lib/products";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/categories";
import ProductGallery from "@/components/ProductGallery";
import AddToCartButton from "@/components/AddToCartButton";
import QuickAddButton from "@/components/QuickAddButton";
import { ShoppingBag, Star, Check, X, Plus } from "lucide-react";

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const {slug} = await params;
  
  // 1. Try to fetch product
  const product = await getProductBySlug(slug);

  if (product) {
    // --- PRODUCT VIEW ---
    const images = [product.image, ...product.gallery.map(g => g.image_url)];
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
                  <Link href={`/${product.categories[0].slug}`} className="hover:text-primary transition-colors">{product.categories[0].name}</Link>
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
                     <Link key={cat.id} href={`/${cat.slug}`} className="text-accent text-sm font-bold uppercase tracking-widest mr-4 hover:underline">{cat.name}</Link>
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
                         <span className="line-through text-gray-300 mr-4 text-2xl" suppressHydrationWarning>{formatPrice(product.price)}</span>
                         <span className="text-red-500 font-medium" suppressHydrationWarning>{formatPrice(product.sale_price)}</span>
                      </>
                  ) : (
                      <span suppressHydrationWarning>{formatPrice(product.price)}</span>
                  )}
               </div>

               <div className="text-gray-500 leading-relaxed mb-8 border-b border-gray-100 pb-8">
                  {product.description}
               </div>

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
                  
                  <AddToCartButton productId={product.id} inventory={product.inventory} />
               </div>

               {/* Accordion / Content placeholder */}
               <div className="mt-auto">
                   <h3 className="font-bold text-primary border-b pb-2 mb-4">Mô tả chi tiết</h3>
                   <div className="prose prose-sm text-gray-500 max-w-none" dangerouslySetInnerHTML={{ __html: product.content || '' }} suppressHydrationWarning={true} />
               </div>
            </div>
         </div>
      </div>
    );
  }

  // 2. Try to fetch category
  const category = await getCategoryBySlug(slug);

  if (category) {
    // --- CATEGORY VIEW ---
    const products = await getProductsByCategory(category.id);

    return (
      <div className="bg-secondary/20 min-h-screen pb-20 pt-12">
         {/* Category Header */}


         <div className="container mx-auto px-6">
            {/* Breadcrumb */}
            <div className="text-sm text-gray-500 mb-8 flex items-center gap-2">
              <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
              <span>/</span>
              <span className="text-primary font-medium">{category.name}</span>
            </div>

            {/* Product Grid */}
            {products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                {products.map((product) => (
                  <Link key={product.id} href={`/${product.slug}`} className="group cursor-pointer block bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="relative aspect-square md:aspect-[3/4] overflow-hidden bg-gray-100 rounded-lg mb-4">
                      <Image
                        src={product.image || '/placeholder.png'}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <QuickAddButton productId={product.id} inventory={product.inventory} />
                      {/* Sale Badge */}
                      {product.sale_price && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-sm uppercase tracking-wide font-bold">
                           -{Math.round(((product.price - product.sale_price) / product.price) * 100)}%
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-primary mb-2 group-hover:text-accent transition-colors line-clamp-1">{product.name}</h3>
                    <div className="flex flex-wrap items-baseline gap-2">
                       {product.sale_price ? (
                         <>
                           <span className="text-red-500 font-bold">{Math.floor(product.sale_price).toLocaleString('vi-VN')}đ</span>
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
              <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                 <p className="text-xl text-gray-400">Chưa có sản phẩm nào trong danh mục này.</p>
                 <Link href="/" className="mt-4 inline-block text-accent hover:underline">Quay lại trang chủ</Link>
              </div>
            )}
         </div>
      </div>
    );
  }

  // 3. Not found
  notFound();
}
