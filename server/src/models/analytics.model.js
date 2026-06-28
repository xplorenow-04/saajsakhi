import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true
    },
    totalOrders: {
        type: Number,
        default: 0
    },
    totalRevenue: {
        type: Number,
        default: 0
    },
    totalProductsSold: {
        type: Number,
        default: 0
    },
    dailyNewUsers: {
        type: Number,
        default: 0
    },
    cancelledOrders: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

analyticsSchema.index({ date: -1 });

export const Analytics = mongoose.model("Analytics", analyticsSchema);
