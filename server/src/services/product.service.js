import slugify from "slugify";
import { Product } from "../models/product.model.js";
import { redis } from "../redis/config.js";
import { ApiError } from "../utils/apiUtils.js";
import { logger } from "../utils/logger.js";

const CACHE_TTL = 300;

class ProductService {
    async createProduct(data, createdBy, images) {
        console.log('Data ', data);

        const slug = slugify(data.name, { lower: true, strict: true }) + "-" + Date.now().toString(36);

        const product = await Product.create({
            ...data,
            slug,
            images: images || [],
            createdBy
        });

        await this.invalidateProductCache();
        logger.info("Product created", { productId: product._id, createdBy });
        return product;
    }

    async getProductById(productId) {
        const cacheKey = `product:${productId}`;
        try {
            const cached = await redis.get(cacheKey);
            if (cached) return JSON.parse(cached);
        } catch (e) {
            logger.warn("Redis get failed", { error: e.message });
        }

        const product = await Product.findById(productId);
        if (!product) throw new ApiError(404, "Product not found");

        try {
            await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(product));
        } catch (e) {
            logger.warn("Redis set failed", { error: e.message });
        }

        return product;
    }

    async getProductBySlug(slug) {
        const cacheKey = `product:slug:${slug}`;
        try {
            const cached = await redis.get(cacheKey);
            if (cached) return JSON.parse(cached);
        } catch (e) {
            logger.warn("Redis get failed", { error: e.message });
        }

        const product = await Product.findOne({ slug });
        if (!product) throw new ApiError(404, "Product not found");

        try {
            await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(product));
        } catch (e) {
            logger.warn("Redis set failed", { error: e.message });
        }

        return product;
    }

    async listProducts(query, page = 1, limit = 20) {
        const { category, minPrice, maxPrice, size, minDiscount, search, sort } = query;

        const filter = { isActive: true };

        if (category) filter.category = category.toLowerCase();
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }
        if (minDiscount) filter.discount = { $gte: parseFloat(minDiscount) };
        if (size) filter["sizes.size"] = size;
        if (search) filter.$text = { $search: search };

        let sortOption = { createdAt: -1 };
        if (sort === "price_asc") sortOption = { price: 1 };
        else if (sort === "price_desc") sortOption = { price: -1 };
        else if (sort === "discount") sortOption = { discount: -1 };
        else if (sort === "newest") sortOption = { createdAt: -1 };
        else if (sort === "popular") sortOption = { viewCount: -1 };

        const cacheKey = `products:${JSON.stringify(filter)}:${sort}:${page}:${limit}`;
        try {
            const cached = await redis.get(cacheKey);
            if (cached) return JSON.parse(cached);
        } catch (e) {
            logger.warn("Redis get failed", { error: e.message });
        }

        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            Product.find(filter).sort(sortOption).skip(skip).limit(limit).lean(),
            Product.countDocuments(filter)
        ]);

        const result = {
            products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        };

        try {
            await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
        } catch (e) {
            logger.warn("Redis set failed", { error: e.message });
        }

        return result;
    }

    async updateProduct(productId, data, userId) {
        const product = await Product.findById(productId);
        if (!product) throw new ApiError(404, "Product not found");

        if (product.createdBy.toString() !== userId.toString()) {
            throw new ApiError(403, "Not authorized to update this product");
        }

        Object.assign(product, data);
        await product.save();

        await this.invalidateProductCache(productId);
        logger.info("Product updated", { productId, userId });
        return product;
    }

    async deleteProduct(productId, userId) {
        const product = await Product.findById(productId);
        if (!product) throw new ApiError(404, "Product not found");

        if (product.createdBy.toString() !== userId.toString()) {
            throw new ApiError(403, "Not authorized to delete this product");
        }

        await Product.findByIdAndDelete(productId);
        await this.invalidateProductCache(productId);
        logger.info("Product deleted", { productId, userId });
        return { deleted: true };
    }

    async incrementViewCount(productId) {
        try {
            await Product.findByIdAndUpdate(productId, { $inc: { viewCount: 1 } });
        } catch (e) {
            logger.warn("View count increment failed", { productId, error: e.message });
        }
    }

    async getCategories() {
        try {
            const cached = await redis.get("categories");
            if (cached) return JSON.parse(cached);
        } catch (e) {
            logger.warn("Redis get failed", { error: e.message });
        }

        const categories = await Product.distinct("category", { isActive: true });

        try {
            await redis.setex("categories", 3600, JSON.stringify(categories));
        } catch (e) {
            logger.warn("Redis set failed", { error: e.message });
        }

        return categories;
    }

    async getFeaturedProducts() {
        const cacheKey = "products:featured";
        try {
            const cached = await redis.get(cacheKey);
            if (cached) return JSON.parse(cached);
        } catch (e) {
            logger.warn("Redis get failed", { error: e.message });
        }

        const products = await Product.find({ isActive: true })
            .sort({ viewCount: -1, createdAt: -1 })
            .limit(8)
            .lean();

        try {
            await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(products));
        } catch (e) {
            logger.warn("Redis set failed", { error: e.message });
        }

        return products;
    }

    async invalidateProductCache(productId = null) {
        try {
            const keys = await redis.keys("products:*");
            if (keys.length > 0) await redis.del(...keys);
            await redis.del("categories");
            await redis.del("products:featured");
            if (productId) {
                await redis.del(`product:${productId}`);
            }
        } catch (e) {
            logger.warn("Cache invalidation failed", { error: e.message });
        }
    }
}

export const productService = new ProductService();
