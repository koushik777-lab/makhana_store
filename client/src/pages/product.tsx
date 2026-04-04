import { useProduct, useProducts } from "@/hooks/use-products";
import { useRoute, useLocation } from "wouter";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { motion } from "framer-motion";
import { Minus, Plus, Heart, HelpCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";

export default function ProductDetail() {
    const [, params] = useRoute("/product/:id");
    const id = params?.id;
    const { data: product, isLoading, error } = useProduct(id || "");
    const { data: allProducts } = useProducts();
    const { addItem, setCartOpen } = useCart();
    const { items: wishlistItems, toggleItem } = useWishlist();
    const [, setLocation] = useLocation();

    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background pt-24 pb-24 flex justify-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-background pt-24 pb-24 text-center">
                <h2 className="text-2xl font-bold text-secondary mb-4">Product not found</h2>
                <Link href="/shop" className="text-primary hover:underline">
                    Return to Shop
                </Link>
            </div>
        );
    }

    const allImages = [product.image, ...(product.images || [])];
    const displayImage = activeImage || product.image;
    const isWishlisted = wishlistItems.some(i => i.id === product.id);

    const relatedProducts = allProducts
        ?.filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4) || [];

    const handleAddToCart = () => {
        addItem(product, quantity);
    };

    const handleBuyNow = () => {
        addItem(product, quantity);
        setCartOpen(false);
        setLocation('/checkout');
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">

                <Link href="/shop" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 text-sm font-bold uppercase tracking-wider">
                    <ArrowLeft className="w-4 h-4" /> Back to Shop
                </Link>

                <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">

                    {/* Left side: Premium Image Display */}
                    <div className="lg:w-1/2 flex flex-col gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full aspect-[4/5] sm:aspect-square bg-surface-low rounded-[2.5rem] overflow-hidden shadow-[0_8px_32px_-8px_rgba(27,28,26,0.05)] relative flex items-center justify-center p-8 group"
                        >

                            <motion.img
                                key={displayImage}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                                src={displayImage}
                                alt={product.name}
                                className="w-full h-full object-contain drop-shadow-2xl relative z-10 transition-transform duration-700 ease-out group-hover:scale-105"
                            />

                            {product.bestSeller && (
                                <div className="absolute top-6 left-6 z-20 px-4 py-1.5 bg-accent text-secondary text-xs font-black uppercase tracking-widest rounded-full shadow-lg">
                                    Best Seller
                                </div>
                            )}

                            <button
                                onClick={() => toggleItem(product)}
                                className="absolute top-6 right-6 z-20 p-3 bg-surface hover:bg-surface-high rounded-full transition-all duration-300 shadow-sm"
                            >
                                <Heart className={`w-6 h-6 ${isWishlisted ? "fill-red-500 text-red-500" : "text-secondary"}`} />
                            </button>
                        </motion.div>

                        {/* Thumbnails */}
                        {allImages.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                {allImages.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(img)}
                                        className={`w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-[3px] transition-all bg-surface-low ${displayImage === img ? 'border-primary shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover mix-blend-multiply" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right side: Product Data */}
                    <div className="lg:w-1/2 flex flex-col py-4 lg:py-10">
                        <motion.h1
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                            className="font-display font-black text-4xl lg:text-5xl xl:text-6xl text-secondary mb-6 leading-tight"
                        >
                            {product.name}
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                            className="flex flex-col gap-2 mb-8"
                        >
                            <div className="flex items-baseline gap-4">
                                <span className="text-3xl font-black text-secondary">
                                    Rs. {(product.price / 100).toFixed(2)}
                                </span>
                                {product.compareAtPrice && product.compareAtPrice > product.price && (
                                    <span className="text-xl font-medium text-muted-foreground line-through decoration-muted-foreground/50">
                                        Rs. {(product.compareAtPrice / 100).toFixed(2)}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground font-medium">
                                Taxes included. <span className="underline decoration-dashed underline-offset-4 cursor-pointer hover:text-secondary">Shipping</span> calculated at checkout.
                            </p>
                        </motion.div>

                        {/* Quantity Selection */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                            className="mb-8"
                        >
                            <div className="flex items-center gap-12">
                                <span className="text-base font-bold text-secondary w-20">Quantity :</span>
                                <div className="flex items-center gap-4">
                                    <button className="px-6 py-3 bg-surface-highest text-foreground font-bold rounded-full  shadow-sm">
                                        {product.size || "325 g"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        <hr className="border-border/60 my-6" />

                        {/* Item Count & Actions */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                            className="mb-12 space-y-6"
                        >
                            <div className="flex items-center gap-12">
                                <span className="text-base font-bold text-secondary w-20">Items :</span>
                                <div className="flex items-center rounded-full h-14 bg-surface shadow-sm overflow-hidden border border-surface-highest">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-14 h-full flex items-center justify-center hover:bg-surface-highest transition-colors text-secondary"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <div className="w-14 h-full flex items-center justify-center font-bold text-secondary text-lg border-x border-surface-highest">
                                        {quantity}
                                    </div>
                                <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-14 h-full flex items-center justify-center hover:bg-surface-highest transition-colors text-secondary"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 0}
                                    className="flex-1 py-5 rounded-full bg-primary text-white font-black text-lg hover:bg-primary/90 transition-all shadow-[0_8px_32px_-8px_rgba(27,28,26,0.15)] active:scale-[0.98] disabled:opacity-50"
                                >
                                    Add to cart
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    disabled={product.stock === 0}
                                    className="flex-1 py-5 rounded-full bg-surface-highest text-secondary font-black text-lg hover:bg-secondary hover:text-white transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
                                >
                                    Buy It Now
                                </button>
                            </div>
                        </motion.div>

                        {/* Description & Composition */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                            className="prose prose-lg text-muted-foreground prose-p:leading-relaxed max-w-none"
                        >
                            <div className="mb-6 font-medium">
                                <strong className="text-secondary font-bold block mb-2">Composition:</strong>
                                {product.flavor} Roasted Fox Nuts, Essential Spice Blends, Natural Flavors. High Protein & Gluten Free.
                            </div>

                            <div className="space-y-4 text-sm mt-8 border-l-4 border-accent pl-6 py-2">
                                <p>{product.description}</p>
                                <p>Packed with essential nutrients, this {product.category}-tier snack redefines wholesome crunching. No more conscious party munching!</p>
                            </div>

                            <div className="flex items-center gap-3 mt-8 pt-8 border-t border-border/40 text-sm font-bold text-secondary uppercase tracking-wider">
                                <HelpCircle className="w-5 h-5 text-accent" /> Have a question about this product?
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Relatable Products Grid */}
                {relatedProducts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="mt-32 pt-20 border-t border-border/50"
                    >
                        <h2 className="font-display font-black text-4xl text-secondary mb-12">You Might Also Like</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
                            {relatedProducts.map(relProduct => (
                                <ProductCard key={relProduct.id} product={relProduct} />
                            ))}
                        </div>
                    </motion.div>
                )}

            </div>
        </div>
    );
}
