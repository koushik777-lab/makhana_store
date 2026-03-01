import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/store/cart";
import { ShoppingBag, User, LogOut, ShieldCheck, Menu } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { user, logout } = useAuth();
  const { items, toggleCart } = useCart();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const NavLinks = () => (
    <>
      <Link href="/" className={`font-medium transition-colors hover:text-primary ${location === '/' ? 'text-primary' : 'text-foreground/80'}`}>Home</Link>
      <Link href="/shop" className={`font-medium transition-colors hover:text-primary ${location === '/shop' ? 'text-primary' : 'text-foreground/80'}`}>Shop</Link>
      <a href="#about" className="font-medium text-foreground/80 transition-colors hover:text-primary">Our Story</a>
    </>
  );

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-display font-bold text-xl shadow-lg">
              M
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-secondary">Makhana<span className="text-primary">.</span></span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <NavLinks />
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleCart}
            className="relative p-2 rounded-full hover:bg-black/5 transition-colors"
          >
            <ShoppingBag className="w-6 h-6 text-secondary" />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.div 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white rounded-full text-xs font-bold flex items-center justify-center shadow-sm"
                >
                  {itemCount}
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {user ? (
            <div className="hidden md:flex items-center gap-4 border-l border-border/50 pl-4">
              <span className="text-sm font-medium text-muted-foreground">Hi, {user.username}</span>
              {user.isAdmin && (
                <Link href="/admin" className="p-2 rounded-full hover:bg-black/5 text-primary transition-colors" title="Admin Dashboard">
                  <ShieldCheck className="w-5 h-5" />
                </Link>
              )}
              <button onClick={() => logout()} className="p-2 rounded-full hover:bg-black/5 text-foreground/70 transition-colors" title="Logout">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link href="/auth" className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary text-white font-medium hover:bg-secondary/90 transition-all hover:shadow-lg hover:-translate-y-0.5">
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}

          <button 
            className="md:hidden p-2 text-secondary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-white/80 backdrop-blur-md border-t border-border/50"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              <NavLinks />
              <div className="h-px bg-border/50 w-full my-2"></div>
              {user ? (
                <>
                  <div className="font-medium text-secondary">Account: {user.username}</div>
                  {user.isAdmin && (
                    <Link href="/admin" className="font-medium text-primary flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> Admin Dashboard
                    </Link>
                  )}
                  <button onClick={() => logout()} className="text-left font-medium text-destructive flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <Link href="/auth" className="font-medium text-primary flex items-center gap-2">
                  <User className="w-4 h-4" /> Sign In / Register
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
