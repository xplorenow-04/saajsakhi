import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
    date: {
        type: String, // format YYYY-MM-DD
        required: true,
        unique: true,
        index: true
    },
    totalRevenue: {
        type: Number,
        default: 0
    },
    totalOrders: {
        type: Number,
        default: 0
    },
    totalUsers: {
        type: Number,
        default: 0
    },
    views: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },
            count: {
                type: Number,
                default: 0
            }
        }
    ]
}, { timestamps: true });

export const Analytics = mongoose.model("Analytics", analyticsSchema);
