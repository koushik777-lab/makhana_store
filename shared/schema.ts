import { z } from "zod";

export const insertUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  mobile: z.string().regex(/^[0-9]{10}$/, "Mobile number must be a valid 10-digit Indian number"),
  password: z.string().min(1, "Password is required"),
});

export const insertProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().int().nonnegative("Price cannot be negative"), // stored in cents/paise
  image: z.string().url("Must be a valid URL"),
  category: z.string().min(1, "Category is required"),
  flavor: z.string().default("Classic"),
  stock: z.number().int().nonnegative().default(0),
  featured: z.boolean().default(false),
  bestSeller: z.boolean().default(false),
  images: z.array(z.string()).default([]),
  size: z.string().default("325 g"),
  compareAtPrice: z.number().int().nonnegative("Price cannot be negative").optional(),
});

export const insertOrderSchema = z.object({
  userId: z.string().optional(), // Will be populated by the server session
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().int().nonnegative()
  })).min(1, "At least one item is required"),
  totalPrice: z.number().int().nonnegative(),
  paymentMethod: z.string().min(1, "Payment method is required"),
  deliveryAddress: z.record(z.any())
});

// Types mapped from Zod (Insert Types)
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// Export Types representing the database Models
export type User = InsertUser & { id: string; isAdmin: boolean };
export type Product = InsertProduct & { id: string; createdAt: Date };
export type Order = InsertOrder & {
  id: string;
  userId: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: Date;
};

export const loginSchema = z.object({
  username: z.string(),
  password: z.string()
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type CreateProductRequest = InsertProduct;
export type UpdateProductRequest = Partial<InsertProduct>;
export type CreateOrderRequest = InsertOrder;
export type UpdateOrderStatusRequest = { orderStatus: string; paymentStatus?: string };

// OTP endpoints
export const requestOtpSchema = insertUserSchema;
export const verifyOtpSchema = insertUserSchema.extend({
  otp: z.string().length(6, "OTP must be exactly 6 digits")
});
export type RequestOtpRequest = z.infer<typeof requestOtpSchema>;
export type VerifyOtpRequest = z.infer<typeof verifyOtpSchema>;
