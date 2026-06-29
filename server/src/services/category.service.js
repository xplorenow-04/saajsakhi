import { Category } from "../models/category.model.js";
import { redisService } from "./redis.service.js";
import { ApiError } from "../utils/apiUtils.js";
import { logger } from "../utils/logger.js";

const CACHE_TTL = 600;

class CategoryService {
    async createCategory(data, userId) {
        const existing = await Category.findOne({
            name: { $regex: new RegExp(`^${data.name.trim()}$`, "i") }
        });
        if (existing) {
            throw new ApiError(400, "Category with this name already exists");
        }

        const category = await Category.create({
            name: data.name.trim(),
            description: (data.description || "").trim(),
            image: data.image || "",
            createdBy: userId
        });

        await this._invalidateCache();
        logger.info("Category created", { categoryId: category._id, name: category.name });
        return category;
    }

    async getAllCategories(includeInactive = false) {
        const cacheKey = includeInactive ? "categories:all" : "categories:active";
        const cached = await redisService.get(cacheKey);
        if (cached) return cached;

        const filter = includeInactive ? {} : { isActive: true };
        const categories = await Category.find(filter)
            .sort({ name: 1 })
            .lean();

        await redisService.set(cacheKey, categories, CACHE_TTL);
        return categories;
    }

    async getCategoryById(id) {
        const cacheKey = `category:${id}`;
        const cached = await redisService.get(cacheKey);
        if (cached) return cached;

        const category = await Category.findById(id);
        if (!category) throw new ApiError(404, "Category not found");

        await redisService.set(cacheKey, category, CACHE_TTL);
        return category;
    }

    async getCategoryBySlug(slug) {
        const cacheKey = `category:slug:${slug}`;
        const cached = await redisService.get(cacheKey);
        if (cached) return cached;

        const category = await Category.findOne({ slug, isActive: true });
        if (!category) throw new ApiError(404, "Category not found");

        await redisService.set(cacheKey, category, CACHE_TTL);
        return category;
    }

    async updateCategory(id, data) {
        const category = await Category.findById(id);
        if (!category) throw new ApiError(404, "Category not found");

        if (data.name && data.name.toLowerCase() !== category.name.toLowerCase()) {
            const duplicate = await Category.findOne({
                name: { $regex: new RegExp(`^${data.name.trim()}$`, "i") },
                _id: { $ne: id }
            });
            if (duplicate) {
                throw new ApiError(400, "Category with this name already exists");
            }
        }

        if (data.name) category.name = data.name.trim();
        if (data.description !== undefined) category.description = data.description.trim();
        if (data.image !== undefined) category.image = data.image;
        if (data.isActive !== undefined) category.isActive = data.isActive;

        await category.save();

        await this._invalidateCache(id);
        logger.info("Category updated", { categoryId: id, name: category.name });
        return category;
    }

    async deleteCategory(id) {
        const category = await Category.findById(id);
        if (!category) throw new ApiError(404, "Category not found");

        await Category.findByIdAndDelete(id);

        await this._invalidateCache(id);
        logger.info("Category deleted", { categoryId: id });
        return { deleted: true };
    }

    async _invalidateCache(categoryId = null) {
        await redisService.delByPattern("categories:*");
        if (categoryId) {
            await redisService.del(`category:${categoryId}`);
        }
    }
}

export const categoryService = new CategoryService();
