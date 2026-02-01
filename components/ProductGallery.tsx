"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [mainImage, setMainImage] = useState(images[0]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    // Set CSS variable for the image position to avoid re-renders if possible, 
    // but React state is fine for this simplicity.
    const image = e.currentTarget.querySelector('img');
    if (image) {
      image.style.transformOrigin = `${x}% ${y}%`;
      image.style.transform = "scale(2)";
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const image = e.currentTarget.querySelector('img');
    if (image) {
      image.style.transformOrigin = "center center";
      image.style.transform = "scale(1)";
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div 
        className="relative aspect-square w-full overflow-hidden bg-white/5 rounded-sm cursor-zoom-in"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={mainImage}
          alt="Product Image"
          fill
          className="object-cover transition-transform duration-200 ease-out"
          priority
        />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setMainImage(img)}
            className={`relative aspect-square overflow-hidden bg-white/5 rounded-sm border-2 transition-all ${
                mainImage === img ? "border-accent" : "border-transparent hover:border-gray-200"
            }`}
          >
            <Image
              src={img}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
