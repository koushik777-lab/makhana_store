import mongoose, { Schema, Document } from "mongoose";

// Setup
export async function connectDB() {
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI must be set");
    }

    await mongoose.connect(process.env.MONGODB_URI);
}

// Interfaces
export interface IUser extends Document {
    username: string;
    mobile?: string;
    password?: string;
    isAdmin: boolean;
    authProvider: string;
    firebaseUid?: string;
}

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    flavor: string;
    stock: number;
    featured: boolean;
    bestSeller: boolean;
    images: string[];
    size: string;
    compareAtPrice?: number;
    createdAt: Date;
}

export interface IOrder extends Document {
    userId: mongoose.Types.ObjectId;
    items: Array<{ productId: string; quantity: number; price: number }>;
    totalPrice: number;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
    deliveryAddress: Record<string, any>;
    createdAt: Date;
}

// Schemas
const userSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true },
    mobile: { type: String, required: false },
    password: { type: String, required: false },
    isAdmin: { type: Boolean, default: false },
    authProvider: { type: String, default: "local" },
    firebaseUid: { type: String, required: false },
});

// Create 'id' virtual for frontend compatibility
userSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret: any) {
        if (ret._id) delete ret._id;
    }
});

const productSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    flavor: { type: String, required: true, default: "Classic" },
    stock: { type: Number, required: true, default: 0 },
    featured: { type: Boolean, required: true, default: false },
    bestSeller: { type: Boolean, default: false },
    images: { type: [String], default: [] },
    size: { type: String, default: "325 g" },
    compareAtPrice: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

productSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret: any) {
        if (ret._id) delete ret._id;
    }
});

const orderSchema = new Schema<IOrder>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: Schema.Types.Mixed, required: true },
    totalPrice: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, required: true, default: "pending" },
    orderStatus: { type: String, required: true, default: "processing" },
    deliveryAddress: { type: Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now }
});

orderSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret: any) {
        if (ret._id) delete ret._id;
    }
});

// Models
export const UserModel = mongoose.model<IUser>("User", userSchema);
export const ProductModel = mongoose.model<IProduct>("Product", productSchema);
export const OrderModel = mongoose.model<IOrder>("Order", orderSchema);
