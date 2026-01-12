
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";

// Mock data
const products = [
  {
    id: 1,
    name: "Velvet Accent Chair",
    price: "$599",
    category: "Chair",
    image: "/category-living.png", // Reusing image for demo
  },
  {
    id: 2,
    name: "Minimalist Coffee Table",
    price: "$349",
    category: "Table",
    image: "/category-bedroom.png", // Reusing
  },
  {
    id: 3,
    name: "Nordic Dining Chair",
    price: "$249",
    category: "Chair",
    image: "/category-dining.png", // Reusing
  },
  {
    id: 4,
    name: "Modern Floor Lamp",
    price: "$199",
    category: "Lighting",
    image: "/hero-bg.png", // Reusing
  },
];

export default function FeaturedProducts() {
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
            <div key={product.id} className="group cursor-pointer">
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 rounded-sm mb-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <button 
                  className="absolute bottom-4 right-4 bg-white text-primary p-3 rounded-full shadow-lg translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-accent hover:text-white"
                  aria-label="Add to cart"
                >
                  <Plus size={20} />
                </button>
                {/* Badge */}
                <span className="absolute top-4 left-4 bg-primary text-white text-xs px-2 py-1 uppercase tracking-wide">New</span>
              </div>
              <h3 className="text-lg font-medium text-primary mb-1 group-hover:text-accent transition-colors">{product.name}</h3>
              <p className="text-gray-500 text-sm mb-2">{product.category}</p>
              <p className="text-primary font-bold">{product.price}</p>
            </div>
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
