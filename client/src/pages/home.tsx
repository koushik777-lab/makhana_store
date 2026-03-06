import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Star, ShieldCheck, Leaf, Zap } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";

export default function Home() {
  const { data: products, isLoading } = useProducts();
  const featuredProducts = products?.filter(p => p.featured).slice(0, 3) || [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40 min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0">
          {/* landing page hero abstract beige background texture */}
          <img src="https://images.unsplash.com/photo-1604871000636-074fa5117945?w=1920&h=1080&fit=crop" className="w-full h-full object-cover opacity-10" alt="Background pattern" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-left w-full"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-primary/20 text-primary font-medium mb-8 text-sm shadow-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                New Flavors Dropped
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
                className="font-display font-black text-5xl md:text-7xl lg:text-8xl text-secondary tracking-tight mb-6 leading-[1.1]"
              >
                Crunch Healthy.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent relative inline-block">
                  Snack Smart.
                  <motion.svg
                    className="absolute -bottom-2 left-0 w-full h-4 text-accent/30 z-[-1]"
                    viewBox="0 0 100 10" preserveAspectRatio="none"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1, duration: 1 }}
                  >
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" />
                  </motion.svg>
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
                className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-lg"
              >
                Premium hand-picked fox nuts, roasted to absolute perfection.
                The guilt-free superfood your body deserves and your tastebuds crave.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-4"
              >
                <Link href="/shop" className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-white font-bold text-lg hover:bg-primary/90 shadow-[0_0_40px_-10px_rgba(235,94,40,0.8)] transition-all hover:-translate-y-1 hover:shadow-[0_0_60px_-15px_rgba(235,94,40,1)] flex items-center justify-center gap-2 group">
                  Shop Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/about" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-secondary border border-border font-bold text-lg hover:border-primary hover:text-primary transition-all hover:-translate-y-1 shadow-sm flex items-center justify-center">
                  Our Story
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Content - Funky Floating Elements */}
            <div className="relative h-[400px] lg:h-[600px] w-full hidden md:block">
              {/* Center Main Product Blob */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 lg:w-96 lg:h-96 bg-gradient-to-tr from-accent to-primary rounded-full blur-[60px] opacity-20 z-0 animate-pulse"
              ></motion.div>

              {/* Main image placeholder for a funky bowl/bag */}
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.4, duration: 1.2, delay: 0.3 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-64 h-64 lg:w-80 lg:h-80"
              >
                <img
                  src="/makhana_main.png"
                  alt="Premium Makhana Bowl"
                  className="w-full h-full object-cover rounded-full shadow-2xl border-8 border-white"
                />
                {/* Floating Price Tag */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-border/50 rotate-12"
                >
                  <p className="text-secondary font-bold text-sm uppercase tracking-wider">Starting at</p>
                  <p className="text-primary font-black text-2xl">₹99</p>
                </motion.div>
              </motion.div>

              {/* Floating Element 1 (Peri Peri) */}
              <motion.div
                initial={{ scale: 0, x: -100, y: -50 }}
                animate={{ scale: 1, x: 0, y: [0, -20, 0] }}
                transition={{
                  scale: { type: "spring", delay: 0.5 },
                  y: { repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }
                }}
                className="absolute top-[10%] left-[10%] z-20 w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg"
              >
                <img src="/makhana_peri_peri.png" className="w-full h-full object-cover" alt="Spicy Makhana" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-3">
                  <span className="text-white font-bold text-xs uppercase tracking-wider">Peri Peri</span>
                </div>
              </motion.div>

              {/* Floating Element 2 (Cheese) */}
              <motion.div
                initial={{ scale: 0, x: 100, y: -50 }}
                animate={{ scale: 1, x: 0, y: [0, 20, 0] }}
                transition={{
                  scale: { type: "spring", delay: 0.7 },
                  y: { repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.7 }
                }}
                className="absolute top-[20%] right-[5%] z-20 w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg"
              >
                <img src="/makhana_cheese.png" className="w-full h-full object-cover" alt="Cheese Makhana" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-2">
                  <span className="text-white font-bold text-[10px] uppercase tracking-wider">Cheesy</span>
                </div>
              </motion.div>

              {/* Floating Element 3 (Mint/Herbal) */}
              <motion.div
                initial={{ scale: 0, x: -50, y: 100 }}
                animate={{ scale: 1, x: 0, y: [0, -15, 0] }}
                transition={{
                  scale: { type: "spring", delay: 0.9 },
                  y: { repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.9 }
                }}
                className="absolute bottom-[10%] left-[20%] z-20 w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg"
              >
                <img src="/makhana_mint.png" className="w-full h-full object-cover" alt="Herbal Makhana" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-2">
                  <span className="text-white font-bold text-xs uppercase tracking-wider">Mint</span>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* Features Banner */}
      <section className="bg-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
            <div className="flex flex-col items-center gap-3">
              <Leaf className="w-8 h-8 text-accent" />
              <span className="font-medium">100% Organic</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Zap className="w-8 h-8 text-accent" />
              <span className="font-medium">High Protein</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-accent" />
              <span className="font-medium">Gluten Free</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Star className="w-8 h-8 text-accent" />
              <span className="font-medium">Premium Grade</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-display font-bold text-4xl text-secondary mb-4">Trending Crunches</h2>
              <p className="text-muted-foreground text-lg">Our community's favorite flavors.</p>
            </div>
            <Link href="/shop" className="hidden md:flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all">
              View All <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-96 rounded-3xl bg-muted animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center md:hidden">
            <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-primary text-primary font-bold">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-bold text-4xl text-secondary mb-16">Don't just take our word for it</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { text: "Absolutely addicted to the peri-peri flavor. The perfect 3PM snack at my desk!", name: "Sarah J." },
              { text: "Finally a healthy snack that doesn't taste like cardboard. Premium quality makhanas.", name: "Mike T." },
              { text: "Switched from potato chips to these and never looking back. So crunchy and fresh!", name: "Priya M." }
            ].map((review, i) => (
              <div key={i} className="bg-background p-8 rounded-3xl relative">
                <div className="text-accent flex justify-center mb-4">
                  {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-secondary font-medium text-lg italic mb-6">"{review.text}"</p>
                <p className="text-muted-foreground text-sm font-bold uppercase tracking-wider">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
