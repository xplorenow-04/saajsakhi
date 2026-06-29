import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiUtils.js";
import { categoryService } from "../services/category.service.js";
import { uploadFileOnCloudinary } from "../services/cloudinary.service.js";
import { logger } from "../utils/logger.js";
import fs from "fs";

export const createCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || name.trim() === "") {
        return res.status(400).json(
            new ApiResponse(400, null, "Category name is required")
        );
    }

    let image = { url: "", publicId: "" };
    if (req.file) {
        const result = await uploadFileOnCloudinary(req.file.path, "image");
        if (result?.success) {
            image = { url: result.secure_url, publicId: result.public_id };
        } else {
            logger.warn("Category image upload failed");
        }
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
    const { name, description, isActive } = req.body;

    let image;
    if (req.file) {
        const result = await uploadFileOnCloudinary(req.file.path, "image");
        if (result?.success) {
            image = { url: result.secure_url, publicId: result.public_id };
        }
    }

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
