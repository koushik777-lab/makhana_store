import { UserModel, ProductModel, OrderModel } from "./models";
import { type InsertUser, type User, type InsertProduct, type Product, type InsertOrder, type Order } from "@shared/schema";
import session from "express-session";
import createMongoStore from "connect-mongo";

export function setupAuth(app: any) {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI must be set");
  }

  const MongoStore = (createMongoStore as any).default || createMongoStore;

  app.use(
    session({
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions'
      }),
      secret: process.env.SESSION_SECRET || 'fallback_secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        secure: process.env.NODE_ENV === "production",
      },
    })
  );
}

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByFirebaseUid(uid: string): Promise<User | undefined>;
  createUser(user: InsertUser | any): Promise<User>;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<void>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, orderStatus: string, paymentStatus?: string): Promise<Order | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id);
    return user ? user.toJSON() as unknown as User : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ username });
    return user ? user.toJSON() as unknown as User : undefined;
  }

  async getUserByFirebaseUid(uid: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ firebaseUid: uid });
    return user ? user.toJSON() as unknown as User : undefined;
  }

  async createUser(insertUser: InsertUser | any): Promise<User> {
    const user = await UserModel.create(insertUser);
    return user.toJSON() as unknown as User;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    const products = await ProductModel.find({});
    return products.map(p => p.toJSON() as unknown as Product);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const product = await ProductModel.findById(id);
    return product ? product.toJSON() as unknown as Product : undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct = await ProductModel.create(product);
    return newProduct.toJSON() as unknown as Product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true } // Return the updated document
    );
    return updatedProduct ? updatedProduct.toJSON() as unknown as Product : undefined;
  }

  async deleteProduct(id: string): Promise<void> {
    await ProductModel.findByIdAndDelete(id);
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    const orders = await OrderModel.find({});
    return orders.map(o => o.toJSON() as unknown as Order);
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const order = await OrderModel.findById(id);
    return order ? order.toJSON() as unknown as Order : undefined;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const newOrder = await OrderModel.create(order);
    return newOrder.toJSON() as unknown as Order;
  }

  async updateOrderStatus(id: string, orderStatus: string, paymentStatus?: string): Promise<Order | undefined> {
    const updates: any = { orderStatus };
    if (paymentStatus) {
      updates.paymentStatus = paymentStatus;
    }
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );
    return updatedOrder ? updatedOrder.toJSON() as unknown as Order : undefined;
  }
}

export const storage = new DatabaseStorage();
