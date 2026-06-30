import { z } from "zod";

export const createProductSchema = z.object({
    name: z.string().min(1).max(200).trim(),
    description: z.string().min(1).max(5000).trim(),
    category: z.string().min(1).max(100).trim(),
    price: z.number().min(0),
    discount: z.number().min(0).max(100).optional().default(0),
    sizes: z.array(z.object({
        size: z.string().min(1).trim(),
        stock: z.number().int().min(0)
    })).min(1)
});

export const updateProductSchema = z.object({
    name: z.string().min(1).max(200).trim().optional(),
    description: z.string().min(1).max(5000).trim().optional(),
    category: z.string().min(1).max(100).trim().optional(),
    price: z.number().min(0).optional(),
    discount: z.number().min(0).max(100).optional(),
    sizes: z.array(z.object({
        size: z.string().min(1).trim(),
        stock: z.number().int().min(0)
    })).optional(),
    isActive: z.boolean().optional()
});


export const addToCartSchema = z.object({
    productId: z.string().min(1),
    size: z.string().min(1),
    quantity: z.number().int().min(1).default(1)
});

export const updateCartItemSchema = z.object({
    quantity: z.number().int().min(1)
});

export const placeOrderSchema = z.object({
    shippingAddress: z.object({
        name: z.string().min(1).max(100).trim(),
        phone: z.string().min(10).max(15).trim(),
        address: z.string().min(1).max(500).trim(),
        city: z.string().min(1).max(100).trim(),
        pincode: z.string().min(1).max(10).trim()
    })
});

export const createDiscountSchema = z.object({
    code: z.string().min(1).max(50).trim(),
    type: z.enum(["percentage", "fixed"]),
    value: z.number().min(0),
    maxUses: z.number().int().min(1).optional(),
    expiresAt: z.string().optional(),
    productIds: z.array(z.string()).optional(),
    minOrderValue: z.number().min(0).optional()
});
