
import Link from "next/link";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary text-white pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <h3 className="text-3xl font-serif font-bold">LuxeComfort</h3>
            <p className="text-gray-400 leading-relaxed">
              Crafting premium furniture for modern living spaces. We blend aesthetics with functionality to create timeless pieces.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="#" icon={<Facebook size={20} />} />
              <SocialLink href="#" icon={<Instagram size={20} />} />
              <SocialLink href="#" icon={<Twitter size={20} />} />
              <SocialLink href="#" icon={<Linkedin size={20} />} />
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-bold mb-6">Shop</h4>
            <ul className="space-y-4 text-gray-400">
              <FooterLink href="#">All Products</FooterLink>
              <FooterLink href="#">Living Room</FooterLink>
              <FooterLink href="#">Bedroom</FooterLink>
              <FooterLink href="#">Dining Room</FooterLink>
              <FooterLink href="#">New Arrivals</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Support</h4>
            <ul className="space-y-4 text-gray-400">
              <FooterLink href="#">Contact Us</FooterLink>
              <FooterLink href="#">Shipping & Returns</FooterLink>
              <FooterLink href="#">FAQs</FooterLink>
              <FooterLink href="#">Care Guide</FooterLink>
              <FooterLink href="#">Privacy Policy</FooterLink>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-bold mb-6">Newsletter</h4>
            <p className="text-gray-400 mb-6">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <form className="flex flex-col space-y-4">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white/10 border border-white/20 text-white px-4 py-3 rounded focus:outline-none focus:border-accent transition-colors"
                required
              />
              <button 
                type="submit" 
                className="bg-accent text-white font-medium px-4 py-3 rounded hover:bg-accent/90 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} LuxeComfort. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a href={href} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-white transition-all">
      {icon}
    </a>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="hover:text-accent transition-colors">
        {children}
      </Link>
    </li>
  );
}
