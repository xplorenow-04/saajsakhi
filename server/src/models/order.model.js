import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    orderedProducts: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            size: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    shippingAddress: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    whatsappSent: {
        type: Boolean,
        default: false
    },
    orderStatus: {
        type: String,
        enum: ["Pending", "Confirmed", "Processing", "Delivered", "Cancelled"],
        default: "Pending",
        index: true
    }
}, { timestamps: true });

export const Order = mongoose.model("Order", orderSchema);
