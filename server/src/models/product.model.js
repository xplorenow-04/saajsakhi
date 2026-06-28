import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    sizes: {
        type: [String],
        required: true,
        default: []
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    images: {
        type: [String],
        required: true,
        default: []
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    views: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Compound index for filtering
productSchema.index({ category: 1, price: 1 });
productSchema.index({ price: 1, discount: -1 });

// Text index for search
productSchema.index({ name: "text", description: "text", category: "text" });

export const Product = mongoose.model("Product", productSchema);
