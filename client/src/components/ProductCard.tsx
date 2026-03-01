import { Product } from "@shared/schema";
import { useCart } from "@/store/cart";
import { Plus, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-border/60 shadow-lg shadow-black/5 transition-all duration-300 hover:shadow-xl hover:border-primary/30"
    >
      <div className="relative aspect-square overflow-hidden bg-muted/30 p-6 flex items-center justify-center">
        {product.featured && (
          <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-accent text-secondary text-xs font-bold rounded-full shadow-sm">
            Best Seller
          </div>
        )}
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        
        {/* Quick Add Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
          <button 
            onClick={() => addItem(product)}
            className="translate-y-4 group-hover:translate-y-0 transition-all duration-300 px-6 py-3 bg-white text-secondary font-bold rounded-full shadow-xl flex items-center gap-2 hover:bg-primary hover:text-white"
          >
            <ShoppingBag className="w-4 h-4" /> Quick Add
          </button>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-display font-bold text-xl text-secondary group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground mt-1 block">
              {product.flavor}
            </span>
          </div>
          <span className="font-bold text-lg text-primary bg-primary/5 px-3 py-1 rounded-lg">
            ${(product.price / 100).toFixed(2)}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground mt-3 line-clamp-2 flex-1">
          {product.description}
        </p>
        
        <button 
          onClick={() => addItem(product)}
          className="w-full mt-6 py-3 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add to Cart
        </button>
      </div>
    </motion.div>
  );
}
