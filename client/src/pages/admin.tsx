import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useProducts, useCreateProduct, useDeleteProduct } from "@/hooks/use-products";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { Package, ShoppingCart, Plus, Trash2, Edit } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertProductSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "add_product">("orders");

  const { data: products } = useProducts();
  const { data: orders } = useOrders();
  const createProduct = useCreateProduct();
  const deleteProduct = useDeleteProduct();
  const updateStatus = useUpdateOrderStatus();

  // Extending schema to coerce price from string to integer (cents)
  const formSchema = insertProductSchema.extend({
    price: z.coerce.number().transform(val => Math.round(val * 100)), // store in cents
    stock: z.coerce.number(),
  });

  const { register, handleSubmit, reset } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { flavor: "Classic", stock: 100, featured: false, category: "Classic" }
  });

  if (authLoading) return <div className="p-10 text-center">Loading...</div>;
  if (!user || !user.isAdmin) {
    setLocation("/");
    return null;
  }

  const onAddProduct = async (data: any) => {
    try {
      await createProduct.mutateAsync(data);
      alert("Product added!");
      reset();
      setActiveTab("products");
    } catch (err) {
      alert("Failed to add product");
    }
  };

  return (
    <div className="min-h-screen bg-background pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display font-bold text-4xl text-secondary mb-8">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className="p-4 bg-primary/10 text-primary rounded-xl"><ShoppingCart className="w-8 h-8"/></div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Orders</p>
              <h3 className="font-display font-bold text-3xl text-secondary">{orders?.length || 0}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className="p-4 bg-accent/20 text-accent rounded-xl"><Package className="w-8 h-8"/></div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Products</p>
              <h3 className="font-display font-bold text-3xl text-secondary">{products?.length || 0}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className="p-4 bg-green-100 text-green-600 rounded-xl"><span className="text-2xl font-bold">$</span></div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Revenue</p>
              <h3 className="font-display font-bold text-3xl text-secondary">
                ${((orders?.reduce((acc, o) => acc + o.totalPrice, 0) || 0) / 100).toFixed(2)}
              </h3>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border/50 pb-4 overflow-x-auto">
          <button 
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-2.5 rounded-full font-bold transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-secondary text-white' : 'bg-white text-secondary hover:bg-black/5'}`}
          >
            Manage Orders
          </button>
          <button 
            onClick={() => setActiveTab("products")}
            className={`px-6 py-2.5 rounded-full font-bold transition-all whitespace-nowrap ${activeTab === 'products' ? 'bg-secondary text-white' : 'bg-white text-secondary hover:bg-black/5'}`}
          >
            Manage Products
          </button>
          <button 
            onClick={() => setActiveTab("add_product")}
            className={`px-6 py-2.5 rounded-full font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'add_product' ? 'bg-primary text-white' : 'bg-white text-primary border border-primary hover:bg-primary/5'}`}
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-sm border border-border/50 p-6 sm:p-8 overflow-hidden">
          {activeTab === "orders" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-medium">
                    <th className="py-4 pr-4">Order ID</th>
                    <th className="py-4 pr-4">Date</th>
                    <th className="py-4 pr-4">Total</th>
                    <th className="py-4 pr-4">Status</th>
                    <th className="py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {orders?.map(order => (
                    <tr key={order.id} className="hover:bg-muted/30">
                      <td className="py-4 pr-4 font-medium">#{order.id}</td>
                      <td className="py-4 pr-4 text-muted-foreground">
                        {new Date(order.createdAt || '').toLocaleDateString()}
                      </td>
                      <td className="py-4 pr-4 font-bold text-primary">
                        ${(order.totalPrice / 100).toFixed(2)}
                      </td>
                      <td className="py-4 pr-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          order.orderStatus === 'processing' ? 'bg-amber-100 text-amber-700' :
                          order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-4">
                        <select 
                          className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary"
                          value={order.orderStatus}
                          onChange={(e) => updateStatus.mutate({ id: order.id, status: { orderStatus: e.target.value } })}
                        >
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {orders?.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No orders yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "products" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.map(product => (
                <div key={product.id} className="border border-border rounded-2xl p-4 flex gap-4 items-center relative group">
                  <div className="w-16 h-16 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                    <img src={product.image} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-secondary line-clamp-1">{product.name}</h4>
                    <p className="text-primary font-medium">${(product.price / 100).toFixed(2)}</p>
                  </div>
                  <button 
                    onClick={() => {
                      if(confirm("Delete this product?")) deleteProduct.mutate(product.id);
                    }}
                    className="p-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 rounded-lg absolute right-4"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "add_product" && (
            <form onSubmit={handleSubmit(onAddProduct)} className="max-w-2xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary mb-1.5">Product Name</label>
                  <input {...register("name")} required className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary mb-1.5">Description</label>
                  <textarea {...register("description")} required rows={3} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Price (USD)</label>
                  <input type="number" step="0.01" {...register("price")} required className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" placeholder="10.99" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Stock Quantity</label>
                  <input type="number" {...register("stock")} required className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Category</label>
                  <select {...register("category")} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none">
                    <option value="Classic">Classic</option>
                    <option value="Spicy">Spicy</option>
                    <option value="Sweet">Sweet</option>
                    <option value="Mix">Mix</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Flavor Tag</label>
                  <input {...register("flavor")} required className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" placeholder="e.g. Peri Peri" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary mb-1.5">Image URL</label>
                  <input {...register("image")} required className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" placeholder="https://images.unsplash.com/..." />
                  <p className="text-xs text-muted-foreground mt-1">Use Unsplash or direct image links</p>
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="featured" {...register("featured")} className="w-5 h-5 accent-primary" />
                  <label htmlFor="featured" className="font-medium text-secondary">Feature on Home Page</label>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={createProduct.isPending}
                className="w-full md:w-auto px-8 py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg disabled:opacity-70"
              >
                {createProduct.isPending ? "Creating..." : "Save Product"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
