import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Award, Users, History } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-secondary pb-20">
      {/* Hero Section */}
      <section className="relative py-24 bg-primary text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 animate-fade-in">Our Story</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light animate-slide-up">
            Crafting timeless furniture that transforms houses into homes since 1995.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative h-[500px] rounded-lg overflow-hidden shadow-2xl bg-gray-200 group">
            {/* Placeholder for About Image */}
            <div className="absolute inset-0 bg-primary/5 flex items-center justify-center text-primary/30 group-hover:bg-primary/10 transition-colors">
               <span className="text-lg font-serif">About Image Placeholder</span>
            </div>
             {/* If real image exists:
             <Image 
               src="/about-mission.jpg" 
               alt="Our Mission" 
               fill 
               className="object-cover transition-transform duration-700 group-hover:scale-105"
             />
             */}
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">Designed for Living, Built to Last</h2>
            <p className="text-lg text-text-light leading-relaxed">
              At Furniture LC, we believe that furniture is more than just functional objects; it's the backdrop of your life's most cherished moments. Our journey began with a simple mission: to make premium quality, design-forward furniture accessible to everyone.
            </p>
            <p className="text-lg text-text-light leading-relaxed">
              We collaborate with world-class artisans and designers to create pieces that blend contemporary aesthetics with traditional craftsmanship. Every curve, stitch, and finish is thoughtfully considered to ensure perfection.
            </p>
            <div className="pt-4 grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-accent mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-primary">Premium Materials</h4>
                  <p className="text-sm text-text-light">Sourced to endure.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-accent mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-primary">Expert Craftsmanship</h4>
                  <p className="text-sm text-text-light">Hand-finished details.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100/50 md:divide-x-0">
            <div className="space-y-2 p-4">
              <History className="w-8 h-8 text-accent mx-auto mb-4" />
              <h3 className="text-4xl font-serif font-bold text-primary">25+</h3>
              <p className="text-text-light">Years of Excellence</p>
            </div>
            <div className="space-y-2 p-4">
              <Users className="w-8 h-8 text-accent mx-auto mb-4" />
              <h3 className="text-4xl font-serif font-bold text-primary">50k+</h3>
              <p className="text-text-light">Happy Customers</p>
            </div>
             <div className="space-y-2 p-4">
              <Award className="w-8 h-8 text-accent mx-auto mb-4" />
              <h3 className="text-4xl font-serif font-bold text-primary">15</h3>
              <p className="text-text-light">Design Awards</p>
            </div>
             <div className="space-y-2 p-4">
              <CheckCircle2 className="w-8 h-8 text-accent mx-auto mb-4" />
              <h3 className="text-4xl font-serif font-bold text-primary">100%</h3>
              <p className="text-text-light">Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

       {/* Values/Why Us */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">Our Core Values</h2>
          <p className="text-lg text-text-light">
            We are guided by a commitment to quality, sustainability, and customer joy in everything we do.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { title: "Sustainable Sourcing", desc: "We are committed to eco-friendly practices, using responsibly sourced wood and recyclable materials whenever possible.", icon: "🌱" },
             { title: "Customer First", desc: "Your home is our priority. From consultation to delivery, we ensure a seamless and delightful experience.", icon: "🤝" },
             { title: "Innovation", desc: "We constantly explore new designs and technologies to bring you furniture that is both beautiful and functional.", icon: "💡" }
           ].map((item, index) => (
             <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border-t-4 border-accent group">
                <div className="text-4xl mb-6 transform group-hover:-translate-y-2 transition-transform duration-300">{item.icon}</div>
                <h3 className="text-xl font-bold text-primary mb-3">{item.title}</h3>
                <p className="text-text-light leading-relaxed">{item.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20 text-center text-white px-6">
        <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">Ready to transform your home?</h2>
        <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">Discover our collection and find the perfect pieces that speak to your style.</p>
        <Link 
          href="/shop" 
          className="inline-block bg-accent hover:bg-white hover:text-primary text-white font-medium px-10 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Explore Collection
        </Link>
      </section>
    </div>
  );
}
