import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/store/cart";
import { X, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export function CartSidebar() {
  const { items, isOpen, setCartOpen, updateQuantity, removeItem, getTotal } = useCart();
  const [, setLocation] = useLocation();

  const handleCheckout = () => {
    setCartOpen(false);
    setLocation("/checkout");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-secondary/40 backdrop-blur-sm z-50"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-background shadow-2xl z-50 flex flex-col border-l border-border/50"
          >
            {/* Header */}
            <div className="px-6 py-6 border-b border-border/50 flex items-center justify-between bg-white">
              <h2 className="font-display font-bold text-2xl flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-primary" /> Your Cart
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 rounded-full hover:bg-black/5 text-muted-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 text-muted-foreground">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-primary/50" />
                  </div>
                  <p className="font-medium text-lg text-secondary">Your cart is empty</p>
                  <p className="text-sm">Looks like you haven't added any crunch yet.</p>
                  <button
                    onClick={() => { setCartOpen(false); setLocation("/shop"); }}
                    className="mt-4 px-6 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    layout
                    key={item.product.id}
                    className="flex gap-4 p-4 rounded-2xl bg-white shadow-sm border border-border/50"
                  >
                    <div className="w-24 h-24 rounded-xl bg-muted/50 overflow-hidden flex-shrink-0">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-secondary">{item.product.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.product.flavor} • {item.product.size || "325 g"}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3 bg-background rounded-full px-2 py-1 border border-border">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full hover:bg-white flex items-center justify-center text-secondary transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-medium text-sm w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full hover:bg-white flex items-center justify-center text-secondary transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-bold text-primary">
                          ₹{((item.product.price * item.quantity) / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 bg-white border-t border-border/50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-muted-foreground font-medium">Subtotal</span>
                  <span className="font-display font-bold text-2xl text-secondary">
                    ₹{(getTotal() / 100).toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 rounded-xl bg-accent text-secondary font-bold text-lg hover:bg-accent/90 transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-2 hover:-translate-y-1 active:translate-y-0"
                >
                  Proceed to Checkout <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
