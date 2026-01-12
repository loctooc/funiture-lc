import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const categories = [
  {
    id: 1,
    name: "Living Room",
    image: "/category-living.png",
    link: "/shop/living-room",
    description: "Create a space for connection and comfort.",
  },
  {
    id: 2,
    name: "Dining Room",
    image: "/category-dining.png",
    link: "/shop/dining-room",
    description: "Elevate your dining experience.",
  },
  {
    id: 3,
    name: "Bedroom-Oasis", // Hyphen purely for visual break?
    image: "/category-bedroom.png",
    link: "/shop/bedroom",
    description: "Rest and recharge in luxury.",
  },
];

export default function Categories() {
  return (
    <section className="py-24 px-6 bg-secondary/30">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <span className="text-accent uppercase tracking-widest text-sm font-semibold mb-2 block">Curated Spaces</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary">Shop by Category</h2>
          </div>
          <Link href="/collections" className="group flex items-center text-primary font-medium hover:text-accent transition-colors mt-6 md:mt-0">
            View All Collections
            <ArrowUpRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              href={cat.link} 
              className="group relative h-[500px] w-full overflow-hidden block"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              
              <div className="absolute bottom-0 left-0 p-8 w-full text-white transform transition-transform duration-500">
                 <h3 className="text-2xl font-serif font-bold mb-2">{cat.name}</h3>
                 <p className="text-white/80 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                    {cat.description}
                 </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
