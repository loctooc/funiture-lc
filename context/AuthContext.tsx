
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
  address?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  checkUser: () => Promise<void>;
  cartCount: number;
  fetchCartCount: () => Promise<void>;
  wishlist: number[];
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: number) => Promise<boolean>; // Returns true if added, false if removed
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  checkUser: async () => {},
  cartCount: 0,
  fetchCartCount: async () => {},
  wishlist: [],
  fetchWishlist: async () => {},
  toggleWishlist: async () => false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const router = useRouter();

  const fetchCartCount = async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setCartCount(data.cartCount);
      }
    } catch (error) {
      console.error('Failed to fetch cart count');
    }
  };

  const fetchWishlist = async () => {
    if (!user) {
        setWishlist([]);
        return;
    }
    try {
      const res = await fetch('/api/wishlist');
      if (res.ok) {
        const data = await res.json();
        setWishlist(data.items);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist');
    }
  };

  const toggleWishlist = async (productId: number): Promise<boolean> => {
    if (!user) {
        router.push('/login');
        return false;
    }
    try {
        const res = await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId })
        });
        if (res.ok) {
            const data = await res.json();
            await fetchWishlist(); // Refresh list
            return data.action === 'added';
        }
        return false;
    } catch (error) {
        console.error("Error toggling wishlist", error);
        return false;
    }
  };

  const checkUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
    // Always fetch cart count after checking user (whether guest or logged in)
    fetchCartCount();
  };

  useEffect(() => {
    if (user) {
        fetchWishlist();
    } else {
        setWishlist([]);
    }
  }, [user]);

  useEffect(() => {
    checkUser();
  }, []);

  const login = async (data: any) => {
    setUser(data.user);
    router.push('/');
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setWishlist([]);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        loading, 
        login, 
        logout, 
        checkUser, 
        cartCount, 
        fetchCartCount,
        wishlist,
        fetchWishlist,
        toggleWishlist
    }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
