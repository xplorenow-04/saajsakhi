import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiUtils.js";
import { adminService } from "../services/admin.service.js";
import { orderService } from "../services/order.service.js";
import { productService } from "../services/product.service.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { redis } from "../redis/config.js";
import { logger } from "../utils/logger.js";
import bcrypt from "bcrypt";

export const getDashboard = asyncHandler(async (req, res) => {
    const stats = await adminService.getDashboardStats();

    return res.status(200).json(
        new ApiResponse(200, stats, "Dashboard data fetched successfully")
    );
});

export const getOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, ...query } = req.query;
    const result = await orderService.adminGetAllOrders(query, parseInt(page), parseInt(limit));

    return res.status(200).json(
        new ApiResponse(200, result, "Orders fetched successfully")
    );
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await orderService.adminUpdateOrderStatus(orderId, status);

    return res.status(200).json(
        new ApiResponse(200, order, "Order status updated successfully")
    );
});

export const deleteOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
        return res.status(404).json(new ApiResponse(404, null, "Order not found"));
    }

    return res.status(200).json(
        new ApiResponse(200, null, "Order deleted successfully")
    );
});

export const getUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, ...query } = req.query;
    const result = await adminService.getUsers(query, parseInt(page), parseInt(limit));

    return res.status(200).json(
        new ApiResponse(200, result, "Users fetched successfully")
    );
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await adminService.toggleUserStatus(id);

    return res.status(200).json(
        new ApiResponse(200, user, "User status updated")
    );
});

export const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await adminService.deleteUser(id);

    return res.status(200).json(
        new ApiResponse(200, result, "User deleted successfully")
    );
});

export const getAnalytics = asyncHandler(async (req, res) => {
    const cacheKey = "admin:analytics";
    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            return res.status(200).json(
                new ApiResponse(200, JSON.parse(cached), "Analytics fetched successfully")
            );
        }
    } catch (e) {
        logger.warn("Redis get failed", { error: e.message });
    }

    const analytics = await orderService.getOrderAnalytics();

    try {
        await redis.setex(cacheKey, 600, JSON.stringify(analytics));
    } catch (e) {
        logger.warn("Redis set failed", { error: e.message });
    }

    return res.status(200).json(
        new ApiResponse(200, analytics, "Analytics fetched successfully")
    );
});

export const createAdmin = asyncHandler(async (req, res) => {
    const { name, email, password, secretKey } = req.body;

    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
        return res.status(403).json(new ApiResponse(403, null, "Invalid secret key"));
    }

    const existing = await User.findOne({ email });
    if (existing) {
        if (existing.role === "admin") {
            return res.status(400).json(new ApiResponse(400, null, "Admin already exists"));
        }
        existing.role = "admin";
        await existing.save();
        return res.status(200).json(new ApiResponse(200, null, "User upgraded to admin"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "admin",
        username: `admin_${Date.now()}`
    });

    return res.status(201).json(
        new ApiResponse(201, null, "Admin created successfully")
    );
});

export const getProductAnalytics = asyncHandler(async (req, res) => {
    const products = await Product.find({ isActive: true })
        .sort({ viewCount: -1 })
        .limit(20)
        .select("name price discount category viewCount images slug")
        .lean();

    return res.status(200).json(
        new ApiResponse(200, products, "Product analytics fetched successfully")
    );
});

export const seedProducts = asyncHandler(async (req, res) => {
    const sampleProducts = [
        {
            name: "Classic White T-Shirt",
            description: "Premium cotton crew neck t-shirt. Comfortable, breathable, and perfect for everyday wear. Features a relaxed fit with ribbed collar.",
            category: "t-shirts",
            price: 1299,
            discount: 20,
            sizes: [{ size: "S", stock: 50 }, { size: "M", stock: 100 }, { size: "L", stock: 80 }, { size: "XL", stock: 40 }],
            images: [{ url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500", publicId: "seed/tshirt1" }]
        },
        {
            name: "Slim Fit Black Jeans",
            description: "Modern slim fit jeans in stretchable denim. Features a mid-rise waist and tapered leg opening. Perfect for casual and semi-formal occasions.",
            category: "jeans",
            price: 2499,
            discount: 15,
            sizes: [{ size: "28", stock: 30 }, { size: "30", stock: 60 }, { size: "32", stock: 90 }, { size: "34", stock: 45 }],
            images: [{ url: "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=500", publicId: "seed/jeans1" }]
        },
        {
            name: "Floral Summer Dress",
            description: "Beautiful floral print dress with a flattering A-line silhouette. Made from lightweight fabric perfect for summer days. Features adjustable straps.",
            category: "dresses",
            price: 3499,
            discount: 25,
            sizes: [{ size: "XS", stock: 25 }, { size: "S", stock: 50 }, { size: "M", stock: 75 }, { size: "L", stock: 35 }],
            images: [{ url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500", publicId: "seed/dress1" }]
        },
        {
            name: "Wool Blend Blazer",
            description: "Sophisticated wool blend blazer with notched lapels. Features a tailored fit with two-button closure and interior pockets.",
            category: "blazers",
            price: 5999,
            discount: 30,
            sizes: [{ size: "S", stock: 20 }, { size: "M", stock: 40 }, { size: "L", stock: 35 }, { size: "XL", stock: 15 }],
            images: [{ url: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=500", publicId: "seed/blazer1" }]
        },
        {
            name: "Cotton Linen Shirt",
            description: "Relaxed fit cotton-linen blend shirt. Perfect for casual office wear or weekend outings. Features a classic collar and button-down front.",
            category: "shirts",
            price: 1999,
            discount: 10,
            sizes: [{ size: "S", stock: 40 }, { size: "M", stock: 80 }, { size: "L", stock: 70 }, { size: "XL", stock: 30 }],
            images: [{ url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500", publicId: "seed/shirt1" }]
        },
        {
            name: "Leather Crossbody Bag",
            description: "Genuine leather crossbody bag with adjustable strap. Features multiple compartments and secure zip closure. Perfect for daily essentials.",
            category: "accessories",
            price: 4499,
            discount: 20,
            sizes: [{ size: "One Size", stock: 50 }],
            images: [{ url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500", publicId: "seed/bag1" }]
        },
        {
            name: "Sports Sneakers",
            description: "Lightweight athletic sneakers with responsive cushioning. Breathable mesh upper with rubber outsole for excellent traction.",
            category: "footwear",
            price: 3999,
            discount: 35,
            sizes: [{ size: "7", stock: 30 }, { size: "8", stock: 50 }, { size: "9", stock: 60 }, { size: "10", stock: 40 }],
            images: [{ url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", publicId: "seed/sneakers1" }]
        },
        {
            name: "Knit Sweater",
            description: "Premium knit sweater in a classic crew neck style. Made from soft acrylic-wool blend for warmth without the weight.",
            category: "sweaters",
            price: 2799,
            discount: 15,
            sizes: [{ size: "S", stock: 35 }, { size: "M", stock: 65 }, { size: "L", stock: 55 }, { size: "XL", stock: 25 }],
            images: [{ url: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=500", publicId: "seed/sweater1" }]
        },
        {
            name: "Cargo Jogger Pants",
            description: "Comfortable cargo joggers with elastic cuffs. Features multiple utility pockets and adjustable drawstring waist.",
            category: "pants",
            price: 1899,
            discount: 20,
            sizes: [{ size: "S", stock: 45 }, { size: "M", stock: 80 }, { size: "L", stock: 60 }, { size: "XL", stock: 30 }],
            images: [{ url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500", publicId: "seed/jogger1" }]
        },
        {
            name: "Denim Jacket",
            description: "Classic denim jacket with a modern trim fit. Features button closure, chest pockets, and adjustable waist tabs.",
            category: "jackets",
            price: 4299,
            discount: 25,
            sizes: [{ size: "S", stock: 25 }, { size: "M", stock: 50 }, { size: "L", stock: 40 }, { size: "XL", stock: 20 }],
            images: [{ url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500", publicId: "seed/jacket1" }]
        }
    ];

    const admin = req.user;
    let created = 0;

    for (const data of sampleProducts) {
        const exists = await Product.findOne({ name: data.name });
        if (!exists) {
            await Product.create({
                ...data,
                createdBy: admin._id,
                slug: data.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString(36)
            });
            created++;
        }
    }

    await productService.invalidateProductCache();

    return res.status(200).json(
        new ApiResponse(200, { created }, `${created} products seeded successfully`)
    );
});

export const exportOrdersPDF = asyncHandler(async (req, res) => {
    const pdfBuffer = await orderService.exportOrdersPDF();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="orders-report-${Date.now()}.pdf"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);
});
