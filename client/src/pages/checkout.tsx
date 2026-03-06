import { useState, useEffect } from "react";
import { useCart } from "@/store/cart";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useCreateOrder } from "@/hooks/use-orders";
import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Truck, CreditCard } from "lucide-react";

import { useQuery } from "@tanstack/react-query";

// Need to safely add Razorpay to window
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Checkout() {
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const createOrder = useCreateOrder();

  const [address, setAddress] = useState({
    street: "", city: "", state: "", zip: ""
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  // Redirect if cart is empty or user not logged in
  useEffect(() => {
    if (!isSuccess) {
      if (items.length === 0) {
        setLocation("/shop");
      } else if (!user) {
        setLocation("/auth");
      }
    }
  }, [items.length, user, isSuccess, setLocation]);

  if ((items.length === 0 || !user) && !isSuccess) {
    return null;
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // 1. If we have a Razorpay Key in our Environment, Trigger Real Flow!
      if (import.meta.env.VITE_RAZORPAY_KEY_ID) {

        // 1a. Generate secure order_id from backend
        const orderRes = await fetch("/api/orders/create-razorpay-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: getTotal() }) // Cents/paise
        });

        if (!orderRes.ok) throw new Error("Failed to initialize payment");
        const orderData = await orderRes.json();

        // 1b. Configure Razorpay overlay
        const logoPath = import.meta.env.VITE_STORE_LOGO;
        const absoluteLogo = logoPath
          ? (logoPath.startsWith("http") ? logoPath : `${window.location.origin}${logoPath.startsWith("/") ? "" : "/"}${logoPath}`)
          : "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&q=80&w=150";

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: orderData.currency,
          name: import.meta.env.VITE_STORE_NAME || "Makhana Store",
          description: import.meta.env.VITE_STORE_DESCRIPTION || "Premium Fox Nuts",
          image: absoluteLogo,
          order_id: orderData.id,
          prefill: {
            name: user.username,
            contact: user.mobile,
          },
          theme: {
            color: "#D97706" // primary shade
          },
          handler: async function (response: any) {
            // 1c. Payment Successful Callback, Save Official Order to DB
            const finalOrderData = {
              userId: user.id,
              items: items.map(i => ({ productId: i.product.id, quantity: i.quantity, price: i.product.price })),
              totalPrice: getTotal(),
              paymentMethod: `razorpay_${response.razorpay_payment_id}`,
              deliveryAddress: address
            };

            const savedOrder = await createOrder.mutateAsync(finalOrderData);
            setCompletedOrder(savedOrder);
            setIsSuccess(true);
            clearCart();
          },
        };

        const razorpayUI = new window.Razorpay(options);
        razorpayUI.on('payment.failed', function (response: any) {
          alert("Payment Failed: " + response.error.description);
        });
        razorpayUI.open();

      } else {
        // 2. Local Development Fallback Mock
        const fallbackOrderData = {
          userId: user.id,
          items: items.map(i => ({ productId: i.product.id, quantity: i.quantity, price: i.product.price })),
          totalPrice: getTotal(),
          paymentMethod: "mock_razorpay",
          deliveryAddress: address
        };

        const savedOrder = await createOrder.mutateAsync(fallbackOrderData);
        setCompletedOrder(savedOrder);
        setIsSuccess(true);
        clearCart();
      }
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("Failed to process order. Please try again.");
    }
  };

  if (isSuccess && completedOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background pt-24 pb-24">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="max-w-2xl w-full bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden"
        >
          {/* Decorative background blur */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-green-500/10 rounded-full blur-[80px]"></div>

          <div className="text-center mb-10 relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20 rotate-3">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="font-display font-black text-4xl text-secondary mb-3">Order Confirmed!</h2>
            <p className="text-muted-foreground text-lg">
              Thank you for your purchase. Your premium makhanas are being prepared.
            </p>
          </div>

          <div className="bg-background rounded-2xl p-6 md:p-8 mb-8 border border-border/50 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-border">
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Order Number</p>
                <p className="font-mono text-lg font-bold text-secondary">#{completedOrder.id}</p>
              </div>
              <div className="md:text-right">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Payment Method</p>
                <p className="font-medium text-secondary">{completedOrder.paymentMethod.includes('mock') ? 'Test Payment' : 'Razorpay Secure'}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Shipping Address</p>
              <address className="not-italic text-secondary font-medium bg-white p-4 rounded-xl border border-border/50">
                {completedOrder.deliveryAddress.street}<br />
                {completedOrder.deliveryAddress.city}, {completedOrder.deliveryAddress.state} {completedOrder.deliveryAddress.zip}
              </address>
            </div>

            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Order Total</p>
              <div className="flex items-center justify-between bg-primary/5 p-4 rounded-xl border border-primary/20">
                <span className="font-bold text-secondary">Total Paid</span>
                <span className="font-black text-2xl text-primary">₹{(completedOrder.totalPrice / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-10 relative z-10">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </div>
              <p className="text-secondary font-medium leading-relaxed">
                Estimate delivery date come into your profile in 24 hr.
              </p>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl bg-accent/5 border border-accent/20">
              <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </div>
              <p className="text-secondary font-medium leading-relaxed">
                To check the status click on your profile then order section.
              </p>
            </div>
          </div>

          <button
            onClick={() => setLocation("/shop")}
            className="w-full py-5 rounded-2xl bg-secondary text-white font-black text-lg hover:bg-secondary/90 transition-all shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] hover:-translate-y-1 relative z-10"
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
                    <input required value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" placeholder="123 Main St" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">City</label>
                    <input required value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" placeholder="New York" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">State/Province</label>
                    <input required value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" placeholder="NY" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Postal Code</label>
                    <input required value={address.zip} onChange={e => setAddress({ ...address, zip: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" placeholder="10001" />
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
                    <span className="font-bold text-secondary">
                      {import.meta.env.VITE_RAZORPAY_KEY_ID ? "Razorpay Secure Checkout" : "Mock Razorpay (Test Mode)"}
                    </span>
                  </div>
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                {!import.meta.env.VITE_RAZORPAY_KEY_ID && (
                  <p className="text-sm text-muted-foreground mt-4 italic">
                    Note: Add VITE_RAZORPAY_KEY_ID to .env to enable real payments.
                  </p>
                )}
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
                        <p className="text-xs text-white/60 text-muted-foreground">Qty: {item.quantity} • {item.product.size || "325 g"}</p>
                      </div>
                    </div>
                    <span className="font-bold text-accent">
                      ₹{((item.product.price * item.quantity) / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/20 pt-6 space-y-3">
                <div className="flex justify-between text-white/80">
                  <span>Subtotal</span>
                  <span>₹{(getTotal() / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-display font-bold text-2xl pt-4 border-t border-white/20">
                  <span>Total</span>
                  <span className="text-accent">₹{(getTotal() / 100).toFixed(2)}</span>
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
