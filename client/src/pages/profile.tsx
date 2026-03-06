import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { Link, useLocation } from "wouter";
import { Package, MapPin, Loader2, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type Order } from "@shared/schema";

export default function Profile() {
    const { user } = useAuth();
    const [, setLocation] = useLocation();
    const { data: orders, isLoading } = useOrders();

    useEffect(() => {
        if (!user) {
            setLocation("/auth");
        }
    }, [user, setLocation]);

    if (!user) return null;

    const getAvatarUrl = (name: string) => {
        return `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(name)}&backgroundColor=e2e8f0,b6e3f4,c0aede,ffdfbf`;
    };

    // Find the first order to extract address, if available
    const savedAddress = orders?.length ? orders[0].deliveryAddress : null;
    const activeOrders = orders?.filter((o: Order) => o.orderStatus !== 'delivered') || [];
    const pastOrders = orders?.filter((o: Order) => o.orderStatus === 'delivered') || [];

    return (
        <div className="min-h-screen bg-background pt-24 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="bg-white rounded-3xl p-8 mb-8 border border-border pb-12 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2"></div>

                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                            <AvatarImage src={getAvatarUrl(user.username)} alt={user.username} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                                {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="font-display font-black text-3xl text-secondary mb-1">
                                Hi, {user.username}
                            </h1>
                            <p className="text-muted-foreground font-medium flex items-center gap-2">
                                {user.mobile}
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                Active Member
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content: Orders */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Active Orders Section */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-display font-bold text-secondary flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    Active Orders ({activeOrders.length})
                                </h2>
                            </div>

                            {isLoading ? (
                                <div className="h-48 flex items-center justify-center bg-white rounded-3xl border border-border">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : activeOrders.length === 0 ? (
                                <div className="bg-white rounded-3xl border border-border p-12 text-center">
                                    <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-secondary mb-2">No active orders right now</h3>
                                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Looks like you haven't placed any orders recently, or they've all been delivered.</p>
                                    <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all">
                                        Start Shopping <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activeOrders.map((order: Order, idx: number) => (
                                        <motion.div
                                            key={order.id}
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                                            className="bg-white rounded-3xl border border-border p-6 shadow-sm overflow-hidden relative"
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Order #{order.id}</p>
                                                    <p className="font-medium text-secondary">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-xl text-primary">₹{(order.totalPrice / 100).toFixed(2)}</p>
                                                    <p className="text-sm font-medium text-muted-foreground">{order.items.length} item(s)</p>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mt-8 pt-8 border-t border-border/50">
                                                <div className="relative pt-1 max-w-md mx-auto">
                                                    <div className="flex mb-2 items-center justify-between mx-4 relative z-10">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${['processing', 'shipped', 'delivered'].includes(order.orderStatus.toLowerCase()) ? 'bg-primary text-white' : 'bg-muted text-muted-foreground border-2 border-border'} shadow-sm`}>
                                                            1
                                                        </div>
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${['shipped', 'delivered'].includes(order.orderStatus.toLowerCase()) ? 'bg-primary text-white' : 'bg-white text-muted-foreground border-2 border-border'} shadow-sm`}>
                                                            2
                                                        </div>
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${['delivered'].includes(order.orderStatus.toLowerCase()) ? 'bg-primary text-white' : 'bg-white text-muted-foreground border-2 border-border'} shadow-sm`}>
                                                            3
                                                        </div>
                                                    </div>

                                                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-primary/10 absolute top-4 left-8 right-8 mt-0.5 -z-0">
                                                        <div style={{ width: order.orderStatus.toLowerCase() === 'processing' ? '0%' : order.orderStatus.toLowerCase() === 'shipped' ? '50%' : '100%' }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500 ease-in-out"></div>
                                                    </div>

                                                    <div className="flex justify-between text-xs font-bold text-secondary text-center px-1">
                                                        <span className="w-16">Processing</span>
                                                        <span className="w-16">Shipped</span>
                                                        <span className="w-16">Delivered</span>
                                                    </div>
                                                </div>
                                            </div>

                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Past Orders Section */}
                        {pastOrders.length > 0 && (
                            <div className="mt-12">
                                <h3 className="font-bold text-xl text-secondary mb-4">Past Orders</h3>
                                <div className="bg-white rounded-3xl border border-border p-4">
                                    {pastOrders.map((order: Order, idx: number) => (
                                        <div key={order.id} className={`flex justify-between items-center p-4 ${idx !== pastOrders.length - 1 ? 'border-b border-border/50' : ''}`}>
                                            <div>
                                                <p className="font-bold text-secondary">Order #{order.id}</p>
                                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-secondary">₹{(order.totalPrice / 100).toFixed(2)}</p>
                                                <span className="inline-block mt-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider">
                                                    Delivered
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">

                        {/* Address Widget */}
                        <div className="bg-white p-8 rounded-3xl border border-border shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-display font-bold text-secondary">Saved Address</h2>
                            </div>

                            {savedAddress ? (
                                <div className="bg-background rounded-2xl p-5 border border-border/50">
                                    <address className="not-italic text-secondary font-medium leading-relaxed">
                                        {savedAddress.street}<br />
                                        {savedAddress.city},<br />
                                        {savedAddress.state} {savedAddress.zip}
                                    </address>
                                </div>
                            ) : (
                                <div className="text-center p-6 bg-background rounded-2xl border border-border border-dashed">
                                    <p className="text-muted-foreground font-medium mb-2">No address saved yet</p>
                                    <p className="text-xs text-muted-foreground">Make your first purchase to quickly save your preferred delivery location.</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-gradient-to-br from-primary to-green-600 p-8 rounded-3xl text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
                            <h3 className="font-display font-bold text-2xl mb-2 relative z-10">Need Help?</h3>
                            <p className="text-white/80 font-medium mb-6 relative z-10">Our support team is available 24/7 to track your shipments.</p>
                            <button className="bg-white text-primary font-bold py-3 px-6 rounded-xl w-full hover:bg-white/90 transition-colors shadow-sm relative z-10">
                                Contact Support
                            </button>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}
