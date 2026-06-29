import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/apiUtils.js";

const DEFAULT_CATEGORIES = ["Men", "Women", "Oversized", "Streetwear", "Accessories", "Shoes"];

export const seedDefaultCategories = async () => {
    try {
        await Category.collection.dropIndex("slug_1");
        console.log("Successfully dropped outdated index slug_1 from categories collection");
    } catch (err) {
        // Ignore error if the index does not exist
    }

    const count = await Category.countDocuments();
    if (count === 0) {
        const docs = DEFAULT_CATEGORIES.map(name => ({ name }));
        await Category.insertMany(docs);
        console.log("Default categories seeded");
    }
};

export const getAllCategoriesService = async () => {
    return await Category.find({ isActive: true }).sort({ name: 1 });
};

export const createCategoryService = async (name) => {
    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existing) {
        throw new ApiError(400, "Category already exists");
    }
    return await Category.create({ name: name.trim() });
};

export const deleteCategoryService = async (id) => {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
        throw new ApiError(404, "Category not found");
    }
    return { message: "Category deleted" };
};
