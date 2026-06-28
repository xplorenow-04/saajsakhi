import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { getCachedData, setCachedData } from "./redis.service.js";

/**
 * Fetch dashboard analytics with Redis caching
 */
export const getDashboardAnalyticsService = async () => {
    const cacheKey = "analytics:dashboard";
    
    // Attempt cache retrieval
    const cached = await getCachedData(cacheKey);
    if (cached) {
        return cached;
    }

    // 1. Total count calculations
    const totalUsers = await User.countDocuments({ role: "customer" });
    const totalProducts = await Product.countDocuments({});
    const totalOrders = await Order.countDocuments({});

    // 2. Monthly Revenue Estimate (Current Month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyRevenueData = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startOfMonth },
                orderStatus: { $ne: "Cancelled" }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$totalPrice" }
            }
        }
    ]);
    const monthlyRevenueEstimate = monthlyRevenueData.length > 0 ? monthlyRevenueData[0].total : 0;

    // 3. Most viewed products
    const mostViewedProducts = await Product.find({})
        .sort({ views: -1 })
        .limit(5)
        .select("name price discount images views");

    // 4. Sales and orders count by month (for charts)
    // Aggregating for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0,0,0,0);

    const monthlySales = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: sixMonthsAgo },
                orderStatus: { $ne: "Cancelled" }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" }
                },
                revenue: { $sum: "$totalPrice" },
                orders: { $sum: 1 }
            }
        },
        {
            $sort: { "_id.year": 1, "_id.month": 1 }
        }
    ]);

    // Format monthly sales data for easier frontend consumption
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthlySales = monthlySales.map(item => {
        return {
            month: `${months[item._id.month - 1]} ${item._id.year}`,
            revenue: item.revenue,
            orders: item.orders
        };
    });

    // 5. Daily orders count for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0,0,0,0);

    const dailySales = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: sevenDaysAgo }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                ordersCount: { $sum: 1 },
                revenue: { $sum: "$totalPrice" }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);

    // Ensure we populate zero values for days with no sales in the last 7 days
    const dailyStats = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const match = dailySales.find(x => x._id === dateStr);
        dailyStats.push({
            date: dateStr,
            ordersCount: match ? match.ordersCount : 0,
            revenue: match ? match.revenue : 0
        });
    }
    dailyStats.reverse(); // put in chronological order

    const result = {
        summary: {
            totalUsers,
            totalProducts,
            totalOrders,
            monthlyRevenueEstimate
        },
        mostViewedProducts,
        monthlySales: formattedMonthlySales,
        dailySales: dailyStats
    };

    // Cache the result for 1 hour (3600 seconds)
    await setCachedData(cacheKey, result, 3600);

    return result;
};
