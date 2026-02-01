import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { getAllCategories } from "@/lib/categories";

export default async function CollectionsPage() {
  const categories = await getAllCategories();

  return (
    <div className="bg-secondary/20 min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative py-24 bg-primary text-white overflow-hidden mb-12">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 animate-fade-in">Our Collections</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light animate-slide-up">
            Explore our thoughtfully curated categories, designed to bring style and comfort to every corner of your home.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6">
         {categories.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {categories.map((cat) => (
               <Link 
                 key={cat.id} 
                 href={`/${cat.slug}`} 
                 className="group relative block h-[400px] overflow-hidden rounded-xl shadow-lg bg-white"
               >
                 {/* Image Support - Assuming category has an image field, or use placeholder */}
                 <div className="absolute inset-0 bg-gray-200">
                    <Image
                      src={cat.image || '/placeholder.png'} // You might need to update this if your DB doesn't have images yet
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
                 </div>

                 <div className="absolute bottom-0 left-0 p-8 w-full text-white z-10">
                    <div className="flex justify-between items-end">
                       <div>
                          <span className="text-xs font-bold uppercase tracking-widest bg-white/20 backdrop-blur-sm px-2 py-1 rounded-sm mb-3 inline-block">
                            {cat.product_count || 0} Products
                          </span>
                          <h2 className="text-3xl font-serif font-bold mb-2 group-hover:text-accent transition-colors">{cat.name}</h2>
                          {cat.description && (
                            <p className="text-gray-200 line-clamp-2 max-w-xs">{cat.description}</p>
                          )}
                       </div>
                       <div className="bg-white text-primary p-3 rounded-full transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <ArrowUpRight size={20} />
                       </div>
                    </div>
                 </div>
               </Link>
             ))}
           </div>
         ) : (
            <div className="text-center py-24">
               <p className="text-xl text-gray-500">No collections found.</p>
            </div>
         )}
      </div>
    </div>
  );
}
