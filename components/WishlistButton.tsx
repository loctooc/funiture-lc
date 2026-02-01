'use client';

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface WishlistButtonProps {
  productId: number;
}

export default function WishlistButton({ productId }: WishlistButtonProps) {
  const { wishlist, toggleWishlist, user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsWishlisted(wishlist.includes(productId));
  }, [wishlist, productId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
        // Optional: Show toast "Please login"
        alert("Please login to use wishlist");
        return;
    }

    setLoading(true);
    await toggleWishlist(productId);
    setLoading(false);
  };

  return (
    <button 
      onClick={handleToggle}
      className={`p-2 rounded-full transition-all duration-300 ${isWishlisted ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'}`}
      disabled={loading}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} className={`transition-transform duration-300 ${isWishlisted ? 'scale-110' : 'scale-100'}`} />
    </button>
  );
}
