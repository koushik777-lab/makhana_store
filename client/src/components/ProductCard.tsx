import { Product } from "@shared/schema";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { Plus, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { items, toggleItem } = useWishlist();
  const isWishlisted = items.some(i => i.id === product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="group flex flex-col bg-surface-lowest rounded-[1.5rem] overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_rgba(27,28,26,0.05)]"
    >
      <div className="relative aspect-square overflow-hidden bg-surface-container p-6 flex items-center justify-center pt-10">
        {product.bestSeller && (
          <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-accent text-secondary text-xs font-bold rounded-full shadow-sm">
            Best Seller
          </div>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleItem(product);
          }}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white hover:scale-110 transition-all duration-300"
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-secondary"}`} />
        </button>

        <Link href={`/product/${product.id}`} className="absolute inset-0 z-0"></Link>
        <img
          src={product.image}
          alt={product.name}
          className="w-[110%] h-[110%] object-contain -ml-4 -mt-4 transform group-hover:scale-[1.15] group-hover:rotate-3 transition-transform duration-700 ease-out z-0 relative pointer-events-none"
        />
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <Link href={`/product/${product.id}`}>
              <h3 className="font-display font-bold text-xl text-secondary group-hover:text-primary transition-colors cursor-pointer block">
                {product.name}
              </h3>
            </Link>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground mt-1 block">
              {product.flavor} • {product.size || "325 g"}
            </span>
          </div>
          <span className="font-bold text-lg text-primary bg-primary/5 px-3 py-1 rounded-lg">
            ₹{(product.price / 100).toFixed(2)}
          </span>
        </div>

        <p className="text-sm text-muted-foreground mt-3 line-clamp-2 flex-1">
          {product.description}
        </p>

        <button
          onClick={() => addItem(product)}
          className="w-full mt-6 py-3 rounded-full bg-surface-highest text-foreground font-bold hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add to Cart
        </button>
      </div>
    </motion.div>
  );
}
