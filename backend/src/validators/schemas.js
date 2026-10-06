import mongoose from "mongoose";
import { z } from "zod";
import { ROLES } from "../models/User.js";
import { TABLE_STATUSES } from "../models/Table.js";
import { ORDER_STATUSES, PAYMENT_METHODS } from "../models/Order.js";

const objectId = z.string().refine((value) => mongoose.isValidObjectId(value), "Invalid id");

// bcrypt kayakhod ghir 72 bytes lowlin dyal password
const password = z.string().min(8, "Password must be at least 8 characters").max(72);
const email = z.string().trim().toLowerCase().email("Invalid email").max(100);

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(50),
  email,
  phone: z.string().trim().regex(/^\+?[0-9 ]{6,20}$/, "Invalid phone number"),
  password,
  // "role" li kaysifto l-frontend kayt-ignora: role kay3tih ghir Admin
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(72),
});

export const roleSchema = z.object({ role: z.enum(ROLES) });

export const createTableSchema = z.object({
  tableNo: z.coerce.number().int().min(1).max(999),
  seats: z.coerce.number().int().min(1).max(20),
});

export const updateTableSchema = z.object({
  status: z.enum(TABLE_STATUSES),
  orderId: objectId.nullable().optional(),
});

const orderItem = z.object({
  name: z.string().trim().min(1).max(100),
  quantity: z.coerce.number().int().min(1).max(20),
});

export const createOrderSchema = z.object({
  customerDetails: z.object({
    name: z.string().trim().min(1).max(60),
    phone: z.string().trim().max(20).optional().default(""),
    guests: z.coerce.number().int().min(1).max(20),
  }),
  items: z.array(orderItem).min(1).max(50),
  table: objectId,
  paymentMethod: z.enum(PAYMENT_METHODS),
  paymentData: z
    .object({
      razorpay_order_id: z.string().max(100),
      razorpay_payment_id: z.string().max(100),
    })
    .optional(),
  // "bills" w "orderStatus" li jaw mn l-client kayt-ignoraw: server howa li kay7sebhom
});

export const updateOrderStatusSchema = z.object({ orderStatus: z.enum(ORDER_STATUSES) });

export const createPaymentSchema = z.object({ items: z.array(orderItem).min(1).max(50) });

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1).max(100),
  razorpay_payment_id: z.string().min(1).max(100),
  razorpay_signature: z.string().min(1).max(256),
});

const dishName = z.string().trim().min(2).max(100);
const category = z.string().trim().min(2).max(50);
const price = z.coerce.number().min(0).max(100000);

export const createMenuItemSchema = z.object({ name: dishName, category, price });

export const updateMenuItemSchema = z
  .object({ name: dishName, category, price, isActive: z.boolean() })
  .partial()
  .refine((value) => Object.keys(value).length > 0, "Nothing to update");
