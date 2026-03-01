import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, setupAuth } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

// Expand express-session to store user id
declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
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
  app.post(api.auth.register.path, async (req, res) => {
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
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    
    const product = await storage.getProduct(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
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
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

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
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    
    await storage.deleteProduct(id);
    res.status(204).send();
  });

  // ---------------------------------------------------------
  // Orders Routes
  // ---------------------------------------------------------
  app.get(api.orders.list.path, requireAuth, async (req, res) => {
    const orders = await storage.getOrders();
    
    // Check if user is admin (simplified check - in reality you'd check user role)
    const user = await storage.getUser(req.session.userId!);
    if (user?.isAdmin) {
      return res.json(orders);
    }
    
    // Regular users only see their own orders
    const userOrders = orders.filter(o => o.userId === req.session.userId);
    res.json(userOrders);
  });

  app.get(api.orders.get.path, requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    
    const order = await storage.getOrder(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Ensure user owns order or is admin
    const user = await storage.getUser(req.session.userId!);
    if (!user?.isAdmin && order.userId !== req.session.userId) {
       return res.status(401).json({ message: "Unauthorized" });
    }

    res.json(order);
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

      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

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
          featured: true
        },
        {
          name: "Peri Peri Makhanas",
          description: "Spicy and tangy African Peri Peri flavor for the perfect kick.",
          price: 24900,
          image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&q=80&w=600",
          category: "Spicy",
          flavor: "Peri Peri",
          stock: 50,
          featured: true
        },
        {
          name: "Cheese & Jalapeno Makhanas",
          description: "Creamy cheese combined with spicy jalapeno.",
          price: 24900,
          image: "https://images.unsplash.com/photo-1582169505937-b9992bd01ed9?auto=format&fit=crop&q=80&w=600",
          category: "Cheesy",
          flavor: "Cheese & Jalapeno",
          stock: 75,
          featured: false
        },
         {
          name: "Mint & Herbs Makhanas",
          description: "Refreshing mint blended with secret herbs.",
          price: 22900,
          image: "https://images.unsplash.com/photo-1604329760661-e71cb83655dc?auto=format&fit=crop&q=80&w=600",
          category: "Herbal",
          flavor: "Mint & Herbs",
          stock: 60,
          featured: true
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
