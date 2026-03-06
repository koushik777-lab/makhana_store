import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, setupAuth } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { connectDB } from "./models";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import Razorpay from "razorpay";

// Razorpay is initialized dynamically inside the route handler
// to ensure environment variables are fully loaded.

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// In-memory OTP store for Registration (Key: mobile string, Value: { otp, expiresAt })
const otpStore = new Map<string, { otp: string, expiresAt: number }>();

// Configure multer
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  })
});

// Expand express-session to store user id
declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Connect to MongoDB
  await connectDB();

  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  setupAuth(app);

  // Authentication Middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // ---------------------------------------------------------
  // Auth Routes
  // ---------------------------------------------------------
  app.post("/api/auth/register/request-otp", async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);

      // Check if username already taken
      const existingUser = await storage.getUserByUsername(input.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Generate a random 6 digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Store in memory for 10 minutes
      otpStore.set(input.mobile, {
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000 // 10 mins
      });

      // Always log in the terminal so development is never blocked
      console.log(`\n======================================`);
      console.log(`💬 SMS TARGET: +91 ${input.mobile}`);
      console.log(`Hi ${input.username}, your Makhana checkout verification code is: ${otp}`);
      if (!process.env.FAST2SMS_API_KEY) console.log(`(Add FAST2SMS_API_KEY to .env to send real SMS)`);
      console.log(`======================================\n`);

      // Send Real SMS if API Key exists
      if (process.env.FAST2SMS_API_KEY) {
        try {
          const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
            method: "POST",
            headers: {
              "authorization": process.env.FAST2SMS_API_KEY,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              route: "otp",
              variables_values: otp,
              numbers: input.mobile,
            })
          });
          const data = await response.json();
          console.log("Fast2SMS API Response:", data);
        } catch (smsError) {
          console.error("Failed to send real SMS:", smsError);
        }
      }

      res.status(200).json({ message: "OTP processed successfully" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/register/verify-otp", async (req, res) => {
    try {
      // Must include OTP inside the request body alongside original credentials
      // Re-use register schema + OTP field
      const verifySchema = z.object({
        username: z.string(),
        mobile: z.string(),
        password: z.string(),
        otp: z.string()
      });
      const input = verifySchema.parse(req.body);

      const record = otpStore.get(input.mobile);
      if (!record) {
        return res.status(400).json({ message: "No active OTP session found or expired." });
      }

      if (Date.now() > record.expiresAt) {
        otpStore.delete(input.mobile);
        return res.status(400).json({ message: "OTP has expired. Please try again." });
      }

      if (record.otp !== input.otp) {
        return res.status(400).json({ message: "Invalid OTP provided." });
      }

      // We had a successful match, clean up the store
      otpStore.delete(input.mobile);

      // Finalize check to avoid race conditions with username
      const existingUser = await storage.getUserByUsername(input.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        username: input.username,
        mobile: input.mobile,
        password: input.password
      });
      req.session.userId = user.id;
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.auth.register.path, async (req, res) => {
    // Keep this route as a fallback, but the frontend will now call request-otp -> verify-otp
    try {
      const input = api.auth.register.input.parse(req.body);

      const existingUser = await storage.getUserByUsername(input.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(input);
      req.session.userId = user.id;
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByUsername(input.username);

      if (!user || user.password !== input.password) { // Simple password matching for demo
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.status(200).json(user);
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.get(api.auth.me.path, async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not logged in" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    res.status(200).json(user);
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => {
      res.status(200).json({ success: true });
    });
  });

  // ---------------------------------------------------------
  // Products Routes
  // ---------------------------------------------------------
  app.get(api.products.list.path, async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.products.get.path, async (req, res) => {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: "Invalid ID" });

    try {
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.post(api.products.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.products.update.path, requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      if (!id) return res.status(400).json({ message: "Invalid ID" });

      const input = api.products.update.input.parse(req.body);
      const product = await storage.updateProduct(id, input);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.delete(api.products.delete.path, requireAuth, async (req, res) => {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: "Invalid ID" });

    try {
      await storage.deleteProduct(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Image Upload Route
  app.post("/api/upload", requireAuth, upload.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Return the URL path to the uploaded file
    const imageUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ url: imageUrl });
  });

  // ---------------------------------------------------------
  // Orders Routes
  // ---------------------------------------------------------
  app.get(api.orders.list.path, requireAuth, async (req, res) => {
    try {
      const orders = await storage.getOrders();

      const user = await storage.getUser(req.session.userId!);
      if (user?.isAdmin) {
        return res.json(orders);
      }

      const userOrders = orders.filter(o => o.userId === req.session.userId);
      res.json(userOrders);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.orders.get.path, requireAuth, async (req, res) => {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: "Invalid ID" });

    try {
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const user = await storage.getUser(req.session.userId!);
      if (!user?.isAdmin && order.userId.toString() !== req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // New Endpoint: Create Razorpay Order
  app.post("/api/orders/create-razorpay-order", requireAuth, async (req, res) => {
    try {
      const { amount } = req.body; // Amount should be in paise/cents
      if (!amount) {
        return res.status(400).json({ message: "Amount is required" });
      }

      const options = {
        amount, // amount in the smallest currency unit
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`
      };

      // Initialize Razorpay dynamically with current environment variables
      const razorpay = new Razorpay({
        key_id: process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_mock',
        key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret',
      });

      const order = await razorpay.orders.create(options);
      res.status(200).json(order);
    } catch (error) {
      console.error("Razorpay Order Error:", error);
      res.status(500).json({ message: "Failed to create Razorpay order" });
    }
  });

  app.post(api.orders.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.orders.create.input.parse({
        ...req.body,
        userId: req.session.userId // override any provided userId with actual logged in user
      });
      const order = await storage.createOrder(input);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.orders.updateStatus.path, requireAuth, async (req, res) => {
    try {
      // Must be admin
      const user = await storage.getUser(req.session.userId!);
      if (!user?.isAdmin) {
        return res.status(401).json({ message: "Unauthorized. Admin only." });
      }

      const id = req.params.id;
      if (!id) return res.status(400).json({ message: "Invalid ID" });

      const input = api.orders.updateStatus.input.parse(req.body);
      const order = await storage.updateOrderStatus(id, input.orderStatus, input.paymentStatus);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  try {
    const products = await storage.getProducts();
    if (products.length === 0) {
      console.log("Seeding database...");

      // Seed Admin User
      await storage.createUser({
        username: "admin",
        password: "password123",
        mobile: "1234567890",
        isAdmin: true
      } as any); // Type cast due to omission in InsertUser

      // Seed Products
      const seedProducts = [
        {
          name: "Classic Salted Makhanas",
          description: "Premium Fox Nuts lightly roasted and perfectly salted.",
          price: 19900, // $199.00 or Rs 199.00 (in cents/paise)
          image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&q=80&w=600",
          category: "Roasted",
          flavor: "Classic Salted",
          stock: 100,
          featured: true,
          bestSeller: true,
          size: "325 g",
          images: ["https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&q=80&w=600"]
        },
        {
          name: "Peri Peri Makhanas",
          description: "Spicy and tangy African Peri Peri flavor for the perfect kick.",
          price: 24900,
          image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&q=80&w=600",
          category: "Spicy",
          flavor: "Peri Peri",
          stock: 50,
          featured: true,
          bestSeller: true,
          size: "325 g",
          images: ["https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&q=80&w=600"]
        },
        {
          name: "Cheese & Jalapeno Makhanas",
          description: "Creamy cheese combined with spicy jalapeno.",
          price: 24900,
          image: "https://images.unsplash.com/photo-1582169505937-b9992bd01ed9?auto=format&fit=crop&q=80&w=600",
          category: "Cheesy",
          flavor: "Cheese & Jalapeno",
          stock: 75,
          featured: false,
          bestSeller: false,
          size: "325 g",
          images: ["https://images.unsplash.com/photo-1582169505937-b9992bd01ed9?auto=format&fit=crop&q=80&w=600"]
        },
        {
          name: "Mint & Herbs Makhanas",
          description: "Refreshing mint blended with secret herbs.",
          price: 22900,
          image: "https://images.unsplash.com/photo-1604329760661-e71cb83655dc?auto=format&fit=crop&q=80&w=600",
          category: "Herbal",
          flavor: "Mint & Herbs",
          stock: 60,
          featured: true,
          bestSeller: false,
          size: "325 g",
          images: ["https://images.unsplash.com/photo-1604329760661-e71cb83655dc?auto=format&fit=crop&q=80&w=600"]
        }
      ];

      for (const product of seedProducts) {
        await storage.createProduct(product);
      }
      console.log("Database seeded with products.");
    }
  } catch (err) {
    console.error("Failed to seed database:", err);
  }
}
