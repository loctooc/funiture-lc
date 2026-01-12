import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.png"
          alt="Luxury Living Room"
          fill
          className="object-cover"
          priority
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=" // Basic placeholder
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center items-start text-white">
        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight animate-fade-in">
          Experience the <br />
          <span className="italic text-accent">Art of Living</span>
        </h1>
        <p className="text-lg md:text-xl font-light mb-10 max-w-xl text-gray-200 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          Discover our curated collection of premium furniture designed to elevate your home with timeless elegance and unmatched comfort.
        </p>
        <Link 
          href="/shop" 
          className="group flex items-center bg-white text-primary px-8 py-4 rounded-full font-medium hover:bg-accent hover:text-white transition-all duration-300 transform hover:scale-105 animate-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          Discover Collection
          <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <span className="block w-[1px] h-16 bg-white/50 mx-auto"></span>
      </div>
    </section>
  );
}
