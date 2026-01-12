"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [mainImage, setMainImage] = useState(images[0]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full overflow-hidden bg-white/5 rounded-sm">
        <Image
          src={mainImage}
          alt="Product Image"
          fill
          className="object-cover transition-all duration-500 hover:scale-105"
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
