import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiUtils.js";
import { categoryService } from "../services/category.service.js";

export const createCategory = asyncHandler(async (req, res) => {
    const { name, description, image } = req.body;

    if (!name || name.trim() === "") {
        return res.status(400).json(
            new ApiResponse(400, null, "Category name is required")
        );
    }

    const category = await categoryService.createCategory(
        { name, description, image },
        req.user._id
    );

    return res.status(201).json(
        new ApiResponse(201, category, "Category created successfully")
    );
});

export const getCategories = asyncHandler(async (req, res) => {
    const includeInactive = req.query.all === "true";
    const categories = await categoryService.getAllCategories(includeInactive);

    return res.status(200).json(
        new ApiResponse(200, categories, "Categories fetched successfully")
    );
});

export const getCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(id);

    return res.status(200).json(
        new ApiResponse(200, category, "Category fetched successfully")
    );
});

export const getCategoryBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const category = await categoryService.getCategoryBySlug(slug);

    return res.status(200).json(
        new ApiResponse(200, category, "Category fetched successfully")
    );
});

export const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, image, isActive } = req.body;

    const category = await categoryService.updateCategory(id, { name, description, image, isActive });

    return res.status(200).json(
        new ApiResponse(200, category, "Category updated successfully")
    );
});

export const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await categoryService.deleteCategory(id);

    return res.status(200).json(
        new ApiResponse(200, null, "Category deleted successfully")
    );
});
