import { z } from "zod";

const phoneRegex = /^\+?[0-9 \-()]{7,20}$/;

const booleanFromString = z.preprocess(
  (value) => {
    if (value === "true" || value === true) return true;
    if (value === "false" || value === false) return false;
    return value;
  },
  z.boolean()
);

export const analyticsPayloadSchema = z.object({
  page: z.string().trim().min(1).max(200).optional().default("/"),
  referrer: z.string().trim().max(1000).optional().nullable(),
});

export const orderItemSchema = z.object({
  id: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(200),
  price: z.preprocess((value) => Number(value), z.number().nonnegative()),
  quantity: z.preprocess((value) => Number(value), z.number().int().positive()),
});

export const orderCreateSchema = z.object({
  customerName: z.string().trim().min(2).max(200),
  customerPhone: z.string().trim().regex(phoneRegex, "Numéro de téléphone invalide"),
  customerAddress: z.string().trim().min(5).max(500),
  items: z.array(orderItemSchema).min(1),
  totalAmount: z.preprocess((value) => Number(value), z.number().positive()),
  paymentMethod: z.enum(["whatsapp", "wave"]).default("whatsapp"),
  waveRef: z.string().trim().min(6).max(100).optional().nullable(),
});

export const orderStatusUpdateSchema = z.object({
  id: z.string().trim().min(1),
  status: z.enum(["pending", "whatsapp_pending", "confirmed", "shipped", "delivered", "cancelled"]),
});

export const productCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).optional().default(""),
  price: z.preprocess((value) => Number(value), z.number().positive()),
  image: z.string().trim().min(1).max(1000),
  category: z.string().trim().min(1).max(100),
  stock: z.preprocess((value) => Number(value), z.number().int().nonnegative()).optional().default(0),
  featured: booleanFromString.optional().default(false),
});

export const productUpdateSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(1000).optional(),
  price: z.preprocess((value) => Number(value), z.number().positive()).optional(),
  image: z.string().trim().min(1).max(1000).optional(),
  category: z.string().trim().min(1).max(100).optional(),
  stock: z.preprocess((value) => Number(value), z.number().int().nonnegative()).optional(),
  featured: booleanFromString.optional(),
  active: booleanFromString.optional(),
});

export const idQuerySchema = z.object({
  id: z.string().trim().min(1),
});

export const categoryQuerySchema = z.object({
  category: z.string().trim().max(100).optional(),
});

export const adminPasswordSchema = z.object({
  oldPassword: z.string().min(8),
  newPassword: z.string().min(10),
});
