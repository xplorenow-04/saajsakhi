import { Product } from "../models/product.model.js";
import { getCachedData, setCachedData, deleteCachedKeys } from "./redis.service.js";
import { deleteFileFromCloudinary } from "./cloudinary.service.js";
import { ApiError } from "../utils/apiUtils.js";

// Helper to extract Cloudinary public ID from a secure URL
const getCloudinaryPublicId = (url) => {
    try {
        const parts = url.split("/");
        const filename = parts[parts.length - 1];
        const publicId = filename.split(".")[0];
        return publicId;
    } catch (err) {
        return null;
    }
};

/**
 * Fetch products with pagination, search, and rich filtering
 */
export const getProductsService = async (queries = {}) => {
    const page = parseInt(queries.page) || 1;
    const limit = parseInt(queries.limit) || 12;
    const skip = (page - 1) * limit;

    const { search, category, minPrice, maxPrice, size, discount } = queries;

    // Create a unique Redis cache key based on query filters
    const cacheKey = `products:list:${JSON.stringify({ page, limit, search, category, minPrice, maxPrice, size, discount })}`;
    
    // Attempt cache retrieval
    const cachedProducts = await getCachedData(cacheKey);
    if (cachedProducts) {
        return cachedProducts;
    }

    // Build MongoDB query
    const dbQuery = {};

    if (search && search.trim() !== "") {
        dbQuery.$text = { $search: search };
    }

    if (category && category.trim() !== "") {
        dbQuery.category = category;
    }

    if ((minPrice !== undefined && minPrice !== "") || (maxPrice !== undefined && maxPrice !== "")) {
        dbQuery.price = {};
        if (minPrice !== undefined && minPrice !== "") dbQuery.price.$gte = Number(minPrice);
        if (maxPrice !== undefined && maxPrice !== "") dbQuery.price.$lte = Number(maxPrice);
    }

    if (size && size.trim() !== "") {
        dbQuery.sizes = size;
    }

    if (discount === "true" || discount === true) {
        dbQuery.discount = { $gt: 0 };
    }

    const totalProducts = await Product.countDocuments(dbQuery);
    
    // Exec query
    let productsQuery = Product.find(dbQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    // If text search, sort by text search score relevance
    if (search && search.trim() !== "") {
        productsQuery = Product.find(dbQuery, { score: { $meta: "textScore" } })
            .sort({ score: { $meta: "textScore" } })
            .skip(skip)
            .limit(limit);
    }

    const products = await productsQuery;

    const result = {
        products,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            totalProducts,
            limit
        }
    };

    // Store in cache for 5 minutes (300 seconds)
    await setCachedData(cacheKey, result, 300);

    return result;
};

/**
 * Fetch featured products for the home page (products with highest discount or views)
 */
export const getFeaturedProductsService = async () => {
    const cacheKey = "products:featured";
    const cached = await getCachedData(cacheKey);
    if (cached) return cached;

    const products = await Product.find({})
        .sort({ discount: -1, viewCount: -1 })
        .limit(8);

    await setCachedData(cacheKey, products, 600); // Cache for 10 minutes
    return products;
};

/**
 * Fetch product details by ID and increment views
 */
export const getProductByIdService = async (productId) => {
    const cacheKey = `product:detail:${productId}`;
    
    // Attempt cache retrieval
    const cached = await getCachedData(cacheKey);
    if (cached) {
        // Increment views in DB asynchronously
        Product.findByIdAndUpdate(productId, { $inc: { viewCount: 1 } }).exec().catch(err => {
            console.error("Failed to increment views on cached hit:", err);
        });
        return cached;
    }

    const product = await Product.findByIdAndUpdate(
        productId,
        { $inc: { viewCount: 1 } },
        { new: true }
    ).populate("createdBy", "name email");

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    await setCachedData(cacheKey, product, 600); // Cache for 10 minutes
    return product;
};

/**
 * Create a new product and invalidate lists caches
 */
export const createProductService = async (productData, creatorId) => {
    const product = await Product.create({
        ...productData,
        createdBy: creatorId
    });

    // Invalidate product listing & homepage caches
    await deleteCachedKeys("products:list:*");
    await deleteCachedKeys("products:featured");

    return product;
};

/**
 * Update an existing product and invalidate detail & lists caches
 */
export const updateProductService = async (productId, updateData) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // Handle image replacements in Cloudinary if new images are provided
    if (updateData.images && updateData.images.length > 0) {
        const oldImages = product.images || [];
        const newUrls = updateData.images.map(img => img.url || img);
        // Delete old images that are not in the new list
        for (const oldImg of oldImages) {
            const oldUrl = oldImg.url || oldImg;
            if (!newUrls.includes(oldUrl)) {
                const pubId = getCloudinaryPublicId(oldUrl);
                if (pubId) {
                    await deleteFileFromCloudinary(pubId);
                }
            }
        }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { $set: updateData },
        { new: true }
    );

    // Invalidate caches
    await deleteCachedKeys(`product:detail:${productId}`);
    await deleteCachedKeys("products:list:*");
    await deleteCachedKeys("products:featured");

    return updatedProduct;
};

/**
 * Delete a product and its images, then invalidate caches
 */
export const deleteProductService = async (productId) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
        for (const img of product.images) {
            const pubId = getCloudinaryPublicId(img.url || img);
            if (pubId) {
                await deleteFileFromCloudinary(pubId);
            }
        }
    }

    await Product.findByIdAndDelete(productId);

    // Invalidate caches
    await deleteCachedKeys(`product:detail:${productId}`);
    await deleteCachedKeys("products:list:*");
    await deleteCachedKeys("products:featured");

    return { success: true, message: "Product and associated media deleted" };
};
