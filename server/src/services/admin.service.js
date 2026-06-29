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
        const firstDayOfPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayOfPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
        const startOfYear = new Date(today.getFullYear(), 0, 1);

        const [
            totalUsers,
            totalProducts,
            totalOrders,
            monthlyOrders,
            monthlyRevenue,
            prevMonthRevenue,
            topProducts,
            dailyOrders,
            recentOrders,
            monthlyRevenueData
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
            Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: firstDayOfPrevMonth, $lte: lastDayOfPrevMonth },
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
                .populate("user", "name email").lean(),
            Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startOfYear },
                        orderStatus: { $ne: "cancelled" }
                    }
                },
                {
                    $group: {
                        _id: { $month: "$createdAt" },
                        revenue: { $sum: "$finalAmount" }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        const currentRevenue = monthlyRevenue[0]?.total || 0;
        const previousRevenue = prevMonthRevenue[0]?.total || 0;

        const revenueChange = previousRevenue > 0
            ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
            : currentRevenue > 0 ? 100 : 0;

        const yearMonths = Array.from({ length: 12 }, (_, i) => {
            const found = monthlyRevenueData.find(d => d._id === i + 1);
            return { month: i + 1, revenue: found?.revenue || 0 };
        });

        const result = {
            totalUsers,
            totalProducts,
            totalOrders,
            monthlyOrders,
            monthlyRevenue: currentRevenue,
            usersChange: 0,
            productsChange: 0,
            ordersChange: 0,
            revenueChange,
            monthlyRevenueData: yearMonths,
            ordersByDay: dailyOrders.map(d => ({ date: d._id, count: d.count, revenue: d.revenue })),
            topProducts: topProducts.map(p => ({
                _id: p._id,
                name: p.name,
                viewCount: p.viewCount,
                price: p.price,
                slug: p.slug,
                image: p.images?.[0]?.url || ""
            })),
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
