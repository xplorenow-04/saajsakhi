import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { Analytics } from "../models/analytics.model.js";
import { redis } from "../redis/config.js";
import { logger } from "../utils/logger.js";

class AdminService {
    async getDashboardStats() {
        const cacheKey = "admin:dashboard";
        try {
            const cached = await redis.get(cacheKey);
            if (cached) return JSON.parse(cached);
        } catch (e) {
            logger.warn("Redis get failed", { error: e.message });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const [
            totalUsers,
            totalProducts,
            totalOrders,
            monthlyOrders,
            monthlyRevenue,
            topProducts,
            dailyOrders,
            recentOrders
        ] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments({ isActive: true }),
            Order.countDocuments(),
            Order.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
            Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: firstDayOfMonth },
                        orderStatus: { $ne: "cancelled" }
                    }
                },
                { $group: { _id: null, total: { $sum: "$finalAmount" } } }
            ]),
            Product.find({ isActive: true }).sort({ viewCount: -1 }).limit(5).lean(),
            Order.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                        }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 },
                        revenue: { $sum: "$finalAmount" }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Order.find().sort({ createdAt: -1 }).limit(5)
                .populate("user", "name email").lean()
        ]);

        const result = {
            totalUsers,
            totalProducts,
            totalOrders,
            monthlyOrders,
            monthlyRevenue: monthlyRevenue[0]?.total || 0,
            topProducts: topProducts.map(p => ({
                _id: p._id,
                name: p.name,
                viewCount: p.viewCount,
                price: p.price,
                slug: p.slug,
                image: p.images?.[0]?.url || ""
            })),
            dailyOrders,
            recentOrders
        };

        try {
            await redis.setex(cacheKey, 300, JSON.stringify(result));
        } catch (e) {
            logger.warn("Redis set failed", { error: e.message });
        }

        return result;
    }

    async getUsers(query, page = 1, limit = 20) {
        const filter = {};
        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: "i" } },
                { email: { $regex: query.search, $options: "i" } }
            ];
        }
        if (query.isDisabled !== undefined) filter.isDisabled = query.isDisabled === "true";

        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            User.find(filter).select("-password -refreshToken").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            User.countDocuments(filter)
        ]);

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async toggleUserStatus(userId) {
        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, "User not found");

        user.isDisabled = !user.isDisabled;
        await user.save();

        logger.info("User status toggled", { userId, isDisabled: user.isDisabled });
        return user;
    }

    async deleteUser(userId) {
        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, "User not found");

        if (user.role === "admin") {
            throw new ApiError(403, "Cannot delete admin users");
        }

        await User.findByIdAndDelete(userId);
        logger.info("User deleted", { userId });
        return { deleted: true };
    }
}

export const adminService = new AdminService();
