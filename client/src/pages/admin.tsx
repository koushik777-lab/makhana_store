import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useProducts, useCreateProduct, useDeleteProduct, useUpdateProduct } from "@/hooks/use-products";
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");

  const { data: products } = useProducts();
  const { data: orders } = useOrders();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateStatus = useUpdateOrderStatus();
  // We need an updateProduct hook if we want to update. The instruction says "Add Edit Product functionality". Let's check hooks next.

  // Extending schema to coerce price from string to integer (cents)
  const formSchema = insertProductSchema.extend({
    price: z.coerce.number().transform(val => Math.round(val * 100)), // store in cents
    compareAtPrice: z.coerce.number().optional().transform(val => val ? Math.round(val * 100) : undefined),
    stock: z.coerce.number(),
  });

  const { register, handleSubmit, reset, watch, setValue } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { flavor: "Classic", stock: 100, featured: false, category: "Classic", bestSeller: false, images: [], size: "325 g" }
  });

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      setLocation("/");
    }
  }, [authLoading, user, setLocation]);

  if (authLoading) return <div className="p-10 text-center">Loading...</div>;
  if (!user || !user.isAdmin) {
    return null;
  }

  const handleAddImageUrl = () => {
    if (!urlInput.trim()) return;
    const primary = watch("image");
    if (!primary) setValue("image", urlInput.trim());
    else setValue("images", [...(watch("images") || []), urlInput.trim()]);
    setUrlInput("");
  };

  const handleRemoveImage = (urlToRemove: string) => {
    const primary = watch("image");
    const secondary = watch("images") || [];
    if (primary === urlToRemove) {
      if (secondary.length > 0) {
        setValue("image", secondary[0]);
        setValue("images", secondary.slice(1));
      } else {
        setValue("image", "");
      }
    } else {
      setValue("images", secondary.filter((u: string) => u !== urlToRemove));
    }
  };

  const onAddProduct = async (data: any) => {
    try {
      if (editingId) {
        await updateProduct.mutateAsync({ id: editingId, updates: data });
        alert("Product updated!");
      } else {
        await createProduct.mutateAsync(data);
        alert("Product added!");
      }
      reset();
      setEditingId(null);
      setActiveTab("products");
    } catch (err) {
      alert(editingId ? "Failed to update product" : "Failed to add product");
    }
  };

  return (
    <div className="min-h-screen bg-background pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display font-bold text-4xl text-secondary mb-8">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className="p-4 bg-primary/10 text-primary rounded-xl"><ShoppingCart className="w-8 h-8" /></div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Orders</p>
              <h3 className="font-display font-bold text-3xl text-secondary">{orders?.length || 0}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className="p-4 bg-accent/20 text-accent rounded-xl"><Package className="w-8 h-8" /></div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Products</p>
              <h3 className="font-display font-bold text-3xl text-secondary">{products?.length || 0}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className="p-4 bg-green-100 text-green-600 rounded-xl"><span className="text-2xl font-bold">₹</span></div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Revenue</p>
              <h3 className="font-display font-bold text-3xl text-secondary">
                ₹{((orders?.reduce((acc, o) => acc + o.totalPrice, 0) || 0) / 100).toFixed(2)}
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
            onClick={() => {
              setEditingId(null);
              reset();
              setActiveTab("add_product");
            }}
            className={`px-6 py-2.5 rounded-full font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'add_product' ? 'bg-primary text-white' : 'bg-white text-primary border border-primary hover:bg-primary/5'}`}
          >
            <Plus className="w-4 h-4" /> {editingId ? "Edit Product" : "Add Product"}
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
                        ₹{(order.totalPrice / 100).toFixed(2)}
                      </td>
                      <td className="py-4 pr-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.orderStatus === 'processing' ? 'bg-amber-100 text-amber-700' :
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
                    <p className="text-primary font-medium">₹{(product.price / 100).toFixed(2)}</p>
                  </div>
                  <div className="absolute right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingId(product.id);
                        // Convert DB cents to dollars/rupees for the input field
                        reset({
                          ...product,
                          price: product.price / 100,
                          compareAtPrice: product.compareAtPrice ? product.compareAtPrice / 100 : undefined
                        } as any);
                        setActiveTab("add_product");
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this product?")) deleteProduct.mutate(product.id);
                      }}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
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
                  <label className="block text-sm font-medium text-secondary mb-1.5">Price (INR)</label>
                  <input type="number" step="0.01" {...register("price")} required className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" placeholder="10.99" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Compare-at Price (INR)</label>
                  <input type="number" step="0.01" {...register("compareAtPrice")} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" placeholder="12.99" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Quantity (e.g. 325 g)</label>
                  <input {...register("size")} required className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" placeholder="325 g" />
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
                    <option value="Cheesy">Cheesy</option>
                    <option value="Sweet">Sweet</option>
                    <option value="Herbal">Herbal</option>
                    <option value="Roasted">Roasted</option>
                    <option value="Mix">Mix</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Flavor Tag</label>
                  <input {...register("flavor")} required className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" placeholder="e.g. Peri Peri" />
                </div>

                <div className="md:col-span-2 space-y-4 pt-4 border-t border-border/50">
                  <h3 className="font-bold text-secondary">Product Images</h3>
                  <p className="text-sm text-muted-foreground mb-4">The first image added will automatically be set as the Primary Image (shown on Home and Shop pages).</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Box 1: URL Input */}
                    <div className="border-2 border-dashed border-border/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-background/30 hover:border-primary/50 transition-colors">
                      <div className="text-secondary font-bold text-lg mb-1">Add via URL</div>
                      <div className="text-sm text-muted-foreground mb-4">Paste an image link directly</div>
                      <div className="flex w-full gap-2 mt-2">
                        <input
                          type="url"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          placeholder="https://example.com/image.png"
                          className="flex-1 px-4 py-3 text-sm rounded-xl bg-white border border-border focus:border-primary outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddImageUrl}
                          className="px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Box 2: Drag & Drop */}
                    <label className="border-2 border-dashed border-border/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-background/30 hover:bg-primary/5 hover:border-primary/50 transition-colors cursor-pointer relative group">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={async (e) => {
                          const files = e.target.files;
                          if (!files || files.length === 0) return;

                          const uploadedUrls: string[] = [];
                          for (let i = 0; i < files.length; i++) {
                            const form = new FormData();
                            form.append("image", files[i]);
                            try {
                              const res = await fetch("/api/upload", { method: "POST", body: form });
                              if (res.ok) {
                                const data = await res.json();
                                uploadedUrls.push(data.url);
                              }
                            } catch (err) {
                              console.error("Upload failed", err);
                            }
                          }

                          let currentPrimary = watch("image");
                          let currentSecondary = watch("images") || [];

                          if (!currentPrimary && uploadedUrls.length > 0) {
                            currentPrimary = uploadedUrls.shift() || "";
                            setValue("image", currentPrimary);
                          }
                          if (uploadedUrls.length > 0) {
                            setValue("images", [...currentSecondary, ...uploadedUrls]);
                          }
                        }}
                      />
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Plus className="w-6 h-6" />
                      </div>
                      <div className="text-secondary font-bold text-lg">Drag & Drop</div>
                      <div className="text-sm text-muted-foreground mt-1">or click to select from device</div>
                    </label>
                  </div>

                  {/* Unified Gallery Preview */}
                  {(watch("image") || (watch("images")?.length > 0)) && (
                    <div className="mt-8 p-6 bg-background/30 rounded-2xl border border-border/50">
                      <h4 className="text-sm font-bold text-secondary mb-4 flex items-center gap-2">
                        Image Gallery <span className="text-xs font-normal text-muted-foreground px-2 py-0.5 bg-muted rounded-full">{watch("image") ? 1 + (watch("images")?.length || 0) : 0} photos</span>
                      </h4>
                      <div className="flex gap-4 flex-wrap">
                        {watch("image") && (
                          <div className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-primary shadow-sm group">
                            <img src={watch("image")} className="w-full h-full object-cover" alt="Primary" />
                            <div className="absolute top-0 left-0 w-full bg-primary text-white text-[10px] font-black py-0.5 text-center uppercase tracking-widest z-10">Primary</div>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(watch("image"))}
                              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20"
                            >
                              <div className="bg-destructive text-white p-2 rounded-lg hover:scale-110 transition-transform shadow-lg">
                                <Trash2 className="w-4 h-4" />
                              </div>
                            </button>
                          </div>
                        )}
                        {watch("images")?.map((url: string, i: number) => (
                          <div key={i} className="relative w-28 h-28 rounded-xl overflow-hidden border border-border shadow-sm group">
                            <img src={url} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(url)}
                              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20"
                            >
                              <div className="bg-destructive text-white p-2 rounded-lg hover:scale-110 transition-transform shadow-lg">
                                <Trash2 className="w-4 h-4" />
                              </div>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hidden required input to satisfy React Hook Form validation for the primary image */}
                  <input type="hidden" {...register("image")} required />
                </div>

                <div className="md:col-span-2 flex flex-col gap-3 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="featured" {...register("featured")} className="w-5 h-5 accent-primary" />
                    <label htmlFor="featured" className="font-medium text-secondary">Feature on Home Page</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="bestSeller" {...register("bestSeller")} className="w-5 h-5 accent-primary" />
                    <label htmlFor="bestSeller" className="font-medium text-secondary">Mark as Best Seller</label>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={createProduct.isPending || updateProduct.isPending}
                className="w-full md:w-auto px-8 py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg disabled:opacity-70"
              >
                {createProduct.isPending || updateProduct.isPending ? "Saving..." : (editingId ? "Update Product" : "Save Product")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
