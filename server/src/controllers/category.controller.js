import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse, ApiError } from "../utils/apiUtils.js";
import {
    getAllCategoriesService,
    createCategoryService,
    deleteCategoryService
} from "../services/category.service.js";

export const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await getAllCategoriesService();
    return res.status(200).json(
        new ApiResponse(200, categories, "Categories fetched successfully")
    );
});

export const createCategory = asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) {
        throw new ApiError(400, "Category name is required");
    }
    const category = await createCategoryService(name);
    return res.status(201).json(
        new ApiResponse(201, category, "Category created successfully")
    );
});

export const deleteCategory = asyncHandler(async (req, res) => {
    const result = await deleteCategoryService(req.params.id);
    return res.status(200).json(
        new ApiResponse(200, null, result.message)
    );
});
