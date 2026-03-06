import { useWishlist } from "@/store/wishlist";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Heart, X, ShoppingCart } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/store/cart";

export function WishlistSidebar() {
    const { items, isOpen, setIsOpen, removeItem } = useWishlist();
    const { addItem } = useCart();

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent className="w-full sm:max-w-md flex flex-col p-0 border-l border-border/50 bg-background/95 backdrop-blur-xl">
                <SheetHeader className="px-6 py-5 border-b border-border/30 bg-white/50">
                    <SheetTitle className="flex items-center gap-3 font-display font-bold text-2xl text-secondary">
                        <Heart className="w-6 h-6 text-primary fill-primary" />
                        Your Wishlist
                        <span className="text-sm font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full ml-auto">
                            {items.length} items
                        </span>
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                    <AnimatePresence initial={false}>
                        {items.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="h-full flex flex-col items-center justify-center text-center space-y-4"
                            >
                                <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center">
                                    <Heart className="w-10 h-10 text-muted-foreground/30" />
                                </div>
                                <h3 className="font-display font-bold text-xl text-secondary">Your wishlist is empty</h3>
                                <p className="text-muted-foreground">Save your favorite makhanas for later!</p>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="mt-4 px-6 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition-all hover:shadow-lg hover:-translate-y-0.5"
                                >
                                    Explore Flavors
                                </button>
                            </motion.div>
                        ) : (
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20, scale: 0.95 }}
                                        className="flex gap-4 p-4 bg-white rounded-2xl border border-border/50 hover:border-primary/30 transition-colors shadow-sm relative group"
                                    >
                                        <Link href={`/product/${item.id}`} onClick={() => setIsOpen(false)}>
                                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted/30 flex-shrink-0 cursor-pointer">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                                            </div>
                                        </Link>

                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div>
                                                <div className="flex justify-between items-start gap-2">
                                                    <h4 className="font-bold text-secondary leading-tight">{item.name}</h4>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{item.flavor} • {item.size || "325 g"}</span>
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                <span className="font-bold text-primary">₹{(item.price / 100).toFixed(2)}</span>

                                                <button
                                                    onClick={() => {
                                                        addItem(item);
                                                        removeItem(item.id);
                                                    }}
                                                    className="flex items-center justify-center gap-2 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-sm font-bold transition-all"
                                                >
                                                    <ShoppingCart className="w-4 h-4" /> Move to Cart
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </SheetContent>
        </Sheet>
    );
}
