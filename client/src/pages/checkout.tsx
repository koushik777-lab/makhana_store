import { useState } from "react";
import { useCart } from "@/store/cart";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useCreateOrder } from "@/hooks/use-orders";
import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Truck, CreditCard } from "lucide-react";

export default function Checkout() {
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const createOrder = useCreateOrder();
  
  const [address, setAddress] = useState({
    street: "", city: "", state: "", zip: ""
  });
  const [isSuccess, setIsSuccess] = useState(false);

  // Redirect if cart is empty or user not logged in
  if (items.length === 0 && !isSuccess) {
    setLocation("/shop");
    return null;
  }
  if (!user && !isSuccess) {
    setLocation("/auth");
    return null;
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const orderData = {
        userId: user.id,
        items: items.map(i => ({ productId: i.product.id, quantity: i.quantity, price: i.product.price })),
        totalPrice: getTotal(),
        paymentMethod: "mock_razorpay",
        deliveryAddress: address
      };
      
      await createOrder.mutateAsync(orderData);
      setIsSuccess(true);
      clearCart();
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("Failed to process order. Please try again.");
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl text-center"
        >
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="font-display font-bold text-3xl text-secondary mb-4">Order Confirmed!</h2>
          <p className="text-muted-foreground mb-8">
            Thank you for your purchase. Your premium makhanas are being prepared for shipping.
          </p>
          <button 
            onClick={() => setLocation("/shop")}
            className="w-full py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            Continue Shopping
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display font-bold text-4xl text-secondary mb-10">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Form Section */}
          <div className="flex-1">
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-border/50">
                <h3 className="font-display font-bold text-xl flex items-center gap-2 mb-6 text-secondary">
                  <Truck className="w-5 h-5 text-primary" /> Delivery Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Street Address</label>
                    <input required value={address.street} onChange={e => setAddress({...address, street: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" placeholder="123 Main St" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">City</label>
                    <input required value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" placeholder="New York" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">State/Province</label>
                    <input required value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" placeholder="NY" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Postal Code</label>
                    <input required value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" placeholder="10001" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-border/50">
                <h3 className="font-display font-bold text-xl flex items-center gap-2 mb-6 text-secondary">
                  <CreditCard className="w-5 h-5 text-primary" /> Payment
                </h3>
                <div className="p-5 rounded-xl border-2 border-primary bg-primary/5 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-primary border-4 border-white shadow-[0_0_0_1px_hsl(var(--primary))]"></div>
                    <span className="font-bold text-secondary">Mock Razorpay (Test Mode)</span>
                  </div>
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mt-4 italic">
                  Note: This is a demo store. No real payment will be processed.
                </p>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-secondary text-white p-8 rounded-3xl shadow-xl sticky top-28">
              <h3 className="font-display font-bold text-2xl mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {items.map(item => (
                  <div key={item.product.id} className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-white/10 p-1 flex-shrink-0">
                        <img src={item.product.image} className="w-full h-full object-cover rounded" alt="" />
                      </div>
                      <div>
                        <p className="font-medium text-sm leading-tight line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-white/60 text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-accent">
                      ${((item.product.price * item.quantity) / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/20 pt-6 space-y-3">
                <div className="flex justify-between text-white/80">
                  <span>Subtotal</span>
                  <span>${(getTotal() / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-display font-bold text-2xl pt-4 border-t border-white/20">
                  <span>Total</span>
                  <span className="text-accent">${(getTotal() / 100).toFixed(2)}</span>
                </div>
              </div>

              <button 
                type="submit"
                form="checkout-form"
                disabled={createOrder.isPending}
                className="w-full mt-8 py-4 rounded-xl bg-accent text-secondary font-bold text-lg hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {createOrder.isPending ? "Processing..." : `Pay ${(getTotal() / 100).toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
