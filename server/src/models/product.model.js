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
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true,
        index: true,
        lowercase: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    sizes: [{
        size: {
            type: String,
            required: true,
            trim: true
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        }
    }],
    images: [{
        url: {
            type: String,
            required: true
        },
        publicId: {
            type: String,
            required: true
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    viewCount: {
        type: Number,
        default: 0
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    }
}, { timestamps: true });

productSchema.index({ category: 1, price: 1 });
productSchema.index({ name: "text", description: "text" });
productSchema.index({ isActive: 1, createdAt: -1 });

productSchema.virtual("discountedPrice").get(function () {
    return this.price - (this.price * (this.discount || 0)) / 100;
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

export const Product = mongoose.model("Product", productSchema);
