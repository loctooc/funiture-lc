import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { getFeaturedProducts } from "@/lib/products";

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  return (
    <section className="py-24 px-6 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <span className="text-accent uppercase tracking-widest text-sm font-semibold mb-2 block animate-fade-in">New Arrivals</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">Trending Now</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Discover our latest additions, crafted with precision and designed to bring a touch of luxury to your daily life.
          </p>
        </div>

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
                  aria-label="View Details"
                >
                  <Plus size={20} />
                </button>
                {/* Badge */}
                {product.is_featured && <span className="absolute top-4 left-4 bg-primary text-white text-xs px-2 py-1 uppercase tracking-wide">Featured</span>}
              </div>
              <h3 className="text-lg font-medium text-primary mb-1 group-hover:text-accent transition-colors">{product.name}</h3>
              <p className="text-primary font-bold">${product.price}</p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link href="/shop" className="inline-block border border-primary text-primary px-10 py-3 rounded-full font-medium hover:bg-primary hover:text-white transition-all">
             View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
