import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  mobile: text("mobile").notNull(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // stored in cents/paise
  image: text("image").notNull(),
  category: text("category").notNull(),
  flavor: text("flavor").notNull().default("Classic"),
  stock: integer("stock").notNull().default(0),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  items: json("items").notNull(), // array of { productId, quantity, price }
  totalPrice: integer("total_price").notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"), // 'pending', 'paid', 'failed'
  orderStatus: text("order_status").notNull().default("processing"), // 'processing', 'shipped', 'delivered'
  deliveryAddress: json("delivery_address").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, isAdmin: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, paymentStatus: true, orderStatus: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export const loginSchema = z.object({
  username: z.string(),
  password: z.string()
});
export type LoginRequest = z.infer<typeof loginSchema>;
export type CreateProductRequest = InsertProduct;
export type UpdateProductRequest = Partial<InsertProduct>;
export type CreateOrderRequest = InsertOrder;
export type UpdateOrderStatusRequest = { orderStatus: string; paymentStatus?: string };
