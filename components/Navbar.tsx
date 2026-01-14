'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, User, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();
  const { user, logout, cartCount } = useAuth();

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 1) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchTerm)}&limit=5`);
          const data = await res.json();
          setSuggestions(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
      setIsSearchFocused(false);
    }
  };

  return (
    <nav
      className={`sticky top-0 w-full z-50 transition-all duration-300 bg-white/95 backdrop-blur-md shadow-sm py-4 text-primary`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-serif font-bold tracking-wide hover:opacity-80 transition-opacity">
          LuxeComfort
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8 font-medium">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/shop">Shop</NavLink>
          <NavLink href="/collections">Collections</NavLink>
          <NavLink href="/about">About</NavLink>
          <NavLink href="/contact">Contact</NavLink>
        </div>

        {/* Search & Icons */}
        <div className="flex items-center space-x-6">
          {/* Search Bar */}
          <div className="relative hidden md:block group">
            <div className="relative">
               <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearch}
                  onFocus={() => setIsSearchFocused(true)}
                  // Delay hiding to allow click on suggestion
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} 
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-[200px] transition-all focus:w-[300px]"
               />
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
               {isSearching && (
                 <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin block"></span>
                 </div>
               )}
            </div>

            {/* Suggestions Dropdown */}
            {isSearchFocused && suggestions.length > 0 && (
               <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden py-2">
                  {suggestions.map((product) => (
                     <Link 
                        key={product.id} 
                        href={`/${product.slug}`}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                     >
                        <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                           <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                           <p className="text-xs text-red-500 font-medium" suppressHydrationWarning>
                              {product.sale_price 
                                ? Math.floor(product.sale_price).toLocaleString('vi-VN') + 'đ' 
                                : Math.floor(product.price).toLocaleString('vi-VN') + 'đ'}
                           </p>
                        </div>
                     </Link>
                  ))}
               </div>
            )}
          </div>

          <button className="hover:text-accent transition-colors p-1 relative" aria-label="Cart">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
          <div className="relative">
            {user ? (
              <button 
                className="hover:text-accent transition-colors p-1 flex items-center gap-2"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label="Account"
              >
                <User size={20} />
                <span className="hidden lg:block text-sm font-medium max-w-[100px] truncate">{user.name}</span>
              </button>
            ) : (
              <Link href="/login" className="hover:text-accent transition-colors p-1" aria-label="Login">
                <User size={20} />
              </Link>
            )}

            {/* User Dropdown */}
            {isUserMenuOpen && user && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 animate-fade-in">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                {/* <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Profile
                </Link> */}
                <button
                  onClick={() => {
                    logout();
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-1" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg py-4 px-6 flex flex-col space-y-4 border-t border-gray-100 animate-slide-up">
          <div className="px-2 pb-2">
             <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  onKeyDown={handleSearch}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <MobileNavLink href="/" onClick={() => setIsMobileMenuOpen(false)}>Home</MobileNavLink>
          <MobileNavLink href="/shop" onClick={() => setIsMobileMenuOpen(false)}>Shop</MobileNavLink>
          <MobileNavLink href="/collections" onClick={() => setIsMobileMenuOpen(false)}>Collections</MobileNavLink>
          <MobileNavLink href="/about" onClick={() => setIsMobileMenuOpen(false)}>About</MobileNavLink>
          <MobileNavLink href="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</MobileNavLink>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm uppercase tracking-wider hover:text-accent transition-colors relative group">
      {children}
      <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-accent transition-all duration-300 group-hover:w-full"></span>
    </Link>
  );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="block text-lg font-medium hover:text-accent transition-colors">
      {children}
    </Link>
  );
}
