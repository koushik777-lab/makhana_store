import { Link, useLocation } from "wouter";
import { Home, ShoppingBag, Heart, User, Search } from "lucide-react";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { motion, AnimatePresence } from "framer-motion";

export function BottomNav() {
  const [location] = useLocation();
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();

  const { toggleCart } = useCart();
  const { setIsOpen: setWishlistOpen } = useWishlist();

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Search, label: "Shop", href: "/shop" },
    { icon: ShoppingBag, label: "Cart", onClick: () => toggleCart(), isCart: true },
    { icon: Heart, label: "Wishlist", onClick: () => setWishlistOpen(true), isWishlist: true },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  return (
    <nav className="md:hidden fixed bottom-6 left-4 right-4 z-50">
      <div className="bg-background/80 backdrop-blur-2xl border border-surface-highest/40 rounded-full px-6 py-3 shadow-[0_8px_32px_-8px_rgba(29,27,24,0.1)] flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = item.href ? location === item.href : false;
          const Icon = item.icon;

          const content = (
            <div 
              className="relative flex flex-col items-center gap-1 group cursor-pointer"
              onClick={item.onClick}
            >
              <div className={`p-2 rounded-full transition-all ${isActive ? 'bg-primary/10 text-primary' : 'text-secondary hover:bg-surface-low'}`}>
                <Icon className="w-6 h-6" />
                
                {item.isCart && cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
                
                {item.isWishlist && wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </div>
              
              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-indicator"
                  className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"
                />
              )}
            </div>
          );

          if (item.href) {
            return (
              <Link key={item.label} href={item.href}>
                {content}
              </Link>
            );
          }

          return <div key={item.label}>{content}</div>;
        })}
      </div>
    </nav>
  );
}
