import { useState, useMemo } from "react";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X } from "lucide-react";

// Collect dynamic categories from products or hardcode 
const CATEGORIES = ["All", "Classic", "Spicy", "Cheesy", "Sweet", "Herbal", "Roasted", "Mix"];

export default function Shop() {
  const { data: products, isLoading } = useProducts();

  // Filter states
  const [activeCategory, setActiveCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState<number>(500); // Max 500 INR
  const [showBestSellersOnly, setShowBestSellersOnly] = useState(false);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter(p => {
      // Category filter
      if (activeCategory !== "All" && p.category.toLowerCase() !== activeCategory.toLowerCase()) {
        return false;
      }
      // Price filter (price is in cents/paise, so divide by 100)
      if ((p.price / 100) > maxPrice) {
        return false;
      }
      // Best Seller filter
      if (showBestSellersOnly && !p.bestSeller) {
        return false;
      }
      return true;
    });
  }, [products, activeCategory, maxPrice, showBestSellersOnly]);

  return (
    <div className="min-h-screen bg-background pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="font-display font-black text-5xl text-secondary mb-6"
          >
            Shop <span className="text-primary">Makhana</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Explore our range of premium, roasted fox nuts. Perfect for any craving.
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <button
            className="lg:hidden flex items-center justify-center gap-2 w-full py-4 bg-surface-lowest rounded-full font-bold text-secondary shadow-sm"
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
          >
            <Filter className="w-5 h-5" /> {showFiltersMobile ? "Hide Filters" : "Show Filters"}
          </button>

          {/* Sidebar Filters */}
          <div className={`lg:w-1/4 flex-shrink-0 space-y-8 ${showFiltersMobile ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-surface p-6 rounded-[2rem] sticky top-24 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-xl text-secondary flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" /> Filters
                </h3>
                {showFiltersMobile && (
                  <button onClick={() => setShowFiltersMobile(false)} className="lg:hidden p-1 text-muted-foreground">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="mb-8">
                <h4 className="font-bold text-secondary mb-4 text-sm uppercase tracking-wider">Categories</h4>
                <div className="space-y-2">
                  {CATEGORIES.map(category => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`block w-full text-left px-4 py-2 rounded-xl text-sm transition-colors ${activeCategory === category
                          ? "bg-surface-highest text-foreground font-bold"
                          : "text-muted-foreground hover:bg-surface-low font-medium"
                        }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="mb-8 border-t border-surface-highest pt-6">
                <h4 className="font-bold text-secondary mb-4 text-sm uppercase tracking-wider">Price Range</h4>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="50"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-sm font-medium text-muted-foreground">
                    <span>₹50</span>
                    <span className="text-secondary font-bold">Up to ₹{maxPrice}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-surface-highest pt-6">
                <h4 className="font-bold text-secondary mb-4 text-sm uppercase tracking-wider">Preferences</h4>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-colors ${showBestSellersOnly ? 'bg-primary border-primary' : 'border-surface-highest group-hover:border-primary/50'}`}>
                    {showBestSellersOnly && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <input
                    type="checkbox"
                    checked={showBestSellersOnly}
                    onChange={(e) => setShowBestSellersOnly(e.target.checked)}
                    className="hidden"
                  />
                  <span className="font-medium text-secondary group-hover:text-primary transition-colors">Best Sellers Only</span>
                </label>
              </div>

              <button
                onClick={() => {
                  setActiveCategory("All");
                  setMaxPrice(500);
                  setShowBestSellersOnly(false);
                }}
                className="w-full mt-8 py-3 rounded-full bg-surface-low text-secondary font-bold hover:bg-surface-highest transition-colors text-sm"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground font-medium">
                Showing <span className="text-secondary font-bold">{filteredProducts.length}</span> products
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-[400px] rounded-3xl bg-muted animate-pulse"></div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-surface-lowest rounded-[2rem] p-12 text-center">
                <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Filter className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-2xl font-display font-bold text-secondary mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your filters to find what you're looking for.</p>
                <button
                  onClick={() => {
                    setActiveCategory("All");
                    setMaxPrice(500);
                    setShowBestSellersOnly(false);
                  }}
                  className="px-6 py-3 bg-surface-highest text-foreground font-bold rounded-full hover:bg-primary hover:text-white transition-colors inline-block"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <AnimatePresence>
                  {filteredProducts.map(product => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
