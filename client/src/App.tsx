import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Components
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { WishlistSidebar } from "@/components/WishlistSidebar";
import { BottomNav } from "@/components/BottomNav";

import Home from "@/pages/home";
import Shop from "@/pages/shop";
import Product from "@/pages/product";
import Auth from "@/pages/auth";
import Checkout from "@/pages/checkout";
import AdminDashboard from "@/pages/admin";
import Profile from "@/pages/profile";
import About from "@/pages/about";

declare global {
  interface Window {
    lenis?: Lenis;
  }
}

function Router() {
  const [pathname] = useLocation();

  useEffect(() => {
    // Lenis handles the smooth scroll, so simply resetting window.scrollTo
    // often conflicts or is overridden by Lenis immediately after mount.
    // However, if Lenis is globally initialized (like it is in App),
    // we can attempt a hard scroll first. Wait a tick so the route renders.
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 10);
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <CartSidebar />
      <WishlistSidebar />
      <BottomNav />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/shop" component={Shop} />
          <Route path="/about" component={About} />
          <Route path="/product/:id" component={Product} />
          <Route path="/auth" component={Auth} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/profile" component={Profile} />
          <Route path="/admin" component={AdminDashboard} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  const [pathname] = useLocation();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Expose lenis globally for route changes
    window.lenis = lenis;

    return () => {
      lenis.destroy();
      delete window.lenis;
    }
  }, []);

  useEffect(() => {
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
