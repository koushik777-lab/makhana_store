import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { ShoppingBag, User, LogOut, ShieldCheck, Menu, Heart, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const { user, logout } = useAuth();
  const { items, toggleCart } = useCart();
  const { items: wishlistItems, setIsOpen: setWishlistOpen } = useWishlist();
  const [location] = useLocation();

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const NavLinks = () => (
    <>
      {["Home", "Shop", "Our Story"].map((item) => {
        const title = item;
        const href = item === "Home" ? "/" : item === "Shop" ? "/shop" : "/about";
        const isActive = location === href;

        return (
          <Link
            key={item}
            href={href}
            className={`relative px-4 py-2 text-sm font-bold transition-colors ${isActive ? "text-primary" : "text-foreground/70 hover:text-foreground"
              }`}
          >
            {isActive && (
              <motion.div
                layoutId="nav-pill"
                className="absolute inset-0 bg-primary/10 rounded-full -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {title}
          </Link>
        );
      })}
    </>
  );

  // Simple heuristic for dynamic avatar based on Name
  const getAvatarUrl = (name: string) => {
    // We use dicebear 'lorelei' which generates nice, human-like avatars deterministically based on the seed (name).
    // It naturally creates a mix of male/female/neutral avatars based on the string hash.
    return `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(name)}&backgroundColor=e2e8f0,b6e3f4,c0aede,ffdfbf`;
  };

  return (
    <header className="fixed top-4 left-0 right-0 z-50 w-full px-4 sm:px-6 pointer-events-none">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="max-w-7xl mx-auto h-[72px] rounded-full bg-background/80 backdrop-blur-[20px] border border-surface-highest/40 shadow-[0_8px_32px_-8px_rgba(29,27,24,0.05)] flex items-center justify-between px-6 pointer-events-auto"
      >
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <motion.img
              whileHover={{ rotate: 5, scale: 1.05 }}
              src="/blogo.png"
              alt="Makhana Logo"
              className="w-12 h-12 md:w-14 md:h-14 object-contain drop-shadow-md"
            />
            <span className="font-display font-black text-xl sm:text-2xl tracking-tight text-secondary group-hover:text-primary transition-colors truncate">
              Makhana<span className="text-primary">.</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 bg-white/50 p-1.5 rounded-full border border-white/40 shadow-inner">
            <NavLinks />
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleCart}
            className="hidden sm:relative sm:p-2.5 sm:rounded-full sm:bg-surface/50 sm:hover:bg-surface sm:border sm:border-surface-highest/40 sm:shadow-sm sm:transition-all"
          >
            <ShoppingBag className="w-5 h-5 text-secondary" />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white rounded-full text-xs font-black flex items-center justify-center shadow-md shadow-primary/30"
                >
                  {itemCount}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setWishlistOpen(true)}
            className="hidden sm:relative sm:p-2.5 sm:rounded-full sm:bg-surface/50 sm:hover:bg-surface sm:border sm:border-surface-highest/40 sm:shadow-sm sm:transition-all"
          >
            <Heart className="w-5 h-5 text-secondary" />
            <AnimatePresence>
              {wishlistCount > 0 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-black flex items-center justify-center shadow-md shadow-red-500/30"
                >
                  {wishlistCount}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {user ? (
            <div className="hidden md:flex items-center gap-4 border-l border-border/30 pl-4 h-8">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative group rounded-full outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-md group-hover:border-primary/50 transition-colors">
                      <AvatarImage src={getAvatarUrl(user.username)} alt={user.username} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/50 shadow-2xl mt-4">
                  <DropdownMenuLabel className="font-normal px-3 py-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none text-secondary tracking-tight">{user.username}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/40 my-2 shadow-[0_1px_0_0_rgba(255,255,255,0.8)]" />

                  {user.isAdmin && (
                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl hover:bg-black/5 focus:bg-black/5 px-3 py-2.5 transition-colors">
                      <Link href="/admin" className="flex items-center w-full font-medium text-foreground/80">
                        <ShieldCheck className="mr-3 h-4 w-4 text-primary" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem asChild className="cursor-pointer rounded-xl hover:bg-black/5 focus:bg-black/5 px-3 py-2.5 transition-colors">
                    <Link href="/profile" className="flex items-center w-full font-medium text-foreground/80">
                      <LayoutDashboard className="mr-3 h-4 w-4 text-secondary" />
                      <span>My Dashboard</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-border/40 my-2 shadow-[0_1px_0_0_rgba(255,255,255,0.8)]" />

                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="cursor-pointer rounded-xl text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive px-3 py-2.5 transition-colors font-medium group"
                  >
                    <LogOut className="mr-3 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Link href="/auth" className="hidden md:flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5">
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}


        </div>
      </motion.div>


    </header>
  );
}
