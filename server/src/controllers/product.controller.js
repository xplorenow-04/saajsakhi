import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiUtils.js";
import { productService } from "../services/product.service.js";
import { uploadFileOnCloudinary, deleteFileFromCloudinary } from "../services/cloudinary.service.js";
import { logger } from "../utils/logger.js";
import fs from "fs";
import mongoose from "mongoose";

const compressAndUpload = async (filePath) => {
    try {
        const result = await uploadFileOnCloudinary(filePath, "image");
        if (!result?.success) {
            throw new Error("Cloudinary upload failed");
        }
        return {
            url: result.secure_url,
            publicId: result.public_id
        };
    } catch (error) {
        logger.error("Cloudinary upload failed", { error: error.message, filePath });
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return null;
    }
};

function parseProductData(body) {
    let data = { ...body };
    if (body.data) {
        try {
            data = JSON.parse(body.data);
        } catch (e) {
            data = { ...body };
        }
    }
    if (data.price !== undefined && data.price !== null && data.price !== "") {
        data.price = Number(data.price);
    }
    if (data.discount !== undefined && data.discount !== null && data.discount !== "") {
        data.discount = Number(data.discount);
    }
    if (typeof data.sizes === "string") {
        try {
            data.sizes = JSON.parse(data.sizes);
        } catch (e) {
            data.sizes = undefined;
        }
    }
    if (data.isActive !== undefined) {
        if (typeof data.isActive === "string") {
            data.isActive = data.isActive === "true";
        } else {
            data.isActive = Boolean(data.isActive);
        }
    }
    if (data.isFeatured !== undefined) {
        if (typeof data.isFeatured === "string") {
            data.isFeatured = data.isFeatured === "true";
        } else {
            data.isFeatured = Boolean(data.isFeatured);
        }
    }
    return data;
}

function validateProductData(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate) {
        if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
            errors.push("Product name is required");
        }
        if (!data.description || typeof data.description !== "string" || data.description.trim().length === 0) {
            errors.push("Product description is required");
        }
        if (!data.category || typeof data.category !== "string" || data.category.trim().length === 0) {
            errors.push("Product category is required");
        }
        if (data.price === undefined || data.price === null || isNaN(data.price) || data.price < 0) {
            errors.push("Valid product price is required");
        }
        if (!data.sizes || !Array.isArray(data.sizes) || data.sizes.length === 0) {
            errors.push("At least one size is required");
        }
    }

    if (data.name !== undefined && (typeof data.name !== "string" || data.name.trim().length === 0)) {
        errors.push("Product name cannot be empty");
    }
    if (data.name !== undefined && data.name.length > 200) {
        errors.push("Product name must be under 200 characters");
    }
    if (data.description !== undefined && data.description.length > 5000) {
        errors.push("Product description must be under 5000 characters");
    }
    if (data.discount !== undefined && (isNaN(data.discount) || data.discount < 0 || data.discount > 100)) {
        errors.push("Discount must be between 0 and 100");
    }
    if (data.price !== undefined && (isNaN(data.price) || data.price < 0)) {
        errors.push("Price must be a positive number");
    }
    if (data.sizes !== undefined && Array.isArray(data.sizes)) {
        for (const s of data.sizes) {
            if (!s.size || typeof s.size !== "string" || s.size.trim().length === 0) {
                errors.push("Each size must have a name");
                break;
            }
            if (s.stock === undefined || isNaN(s.stock) || s.stock < 0) {
                errors.push("Each size must have a valid stock count");
                break;
            }
        }
    }

    return errors;
}

export const createProduct = asyncHandler(async (req, res) => {
    const productData = parseProductData(req.body);
    console.log('Product data ', productData);


    const errors = validateProductData(productData, false);
    if (errors.length > 0) {
        return res.status(400).json(
            new ApiResponse(400, null, errors.join("; "))
        );
    }

    let images = [];
    if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map(file => compressAndUpload(file.path));
        const results = await Promise.all(uploadPromises);
        images = results.filter(Boolean);
    }

    const product = await productService.createProduct(productData, req.user._id, images);

    return res.status(201).json(
        new ApiResponse(201, product, "Product created successfully")
    );
});

export const getProduct = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    if (!slug || slug.trim() === "") {
        return res.status(400).json(
            new ApiResponse(400, null, "Product slug is required")
        );
    }

    const product = await productService.getProductBySlug(slug);
    const updated = await productService.incrementViewCount(product._id, slug);

    return res.status(200).json(
        new ApiResponse(200, updated || product, "Product fetched successfully")
    );
});

export const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(
            new ApiResponse(400, null, "Invalid product ID")
        );
    }

    const product = await productService.getProductById(id);

    return res.status(200).json(
        new ApiResponse(200, product, "Product fetched successfully")
    );
});

export const listProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, ...filters } = req.query;
    const result = await productService.listProducts(filters, parseInt(page), parseInt(limit));

    return res.status(200).json(
        new ApiResponse(200, result, "Products fetched successfully")
    );
});

export const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(
            new ApiResponse(400, null, "Invalid product ID")
        );
    }

    const productData = parseProductData(req.body);

    const errors = validateProductData(productData, true);
    if (errors.length > 0) {
        return res.status(400).json(
            new ApiResponse(400, null, errors.join("; "))
        );
    }

    if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map(file => compressAndUpload(file.path));
        const results = await Promise.all(uploadPromises);
        productData.images = results.filter(Boolean);
    }

    const product = await productService.updateProduct(id, productData, req.user._id);

    return res.status(200).json(
        new ApiResponse(200, product, "Product updated successfully")
    );
});

export const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(
            new ApiResponse(400, null, "Invalid product ID")
        );
    }

    const product = await productService.getProductById(id);

    if (product.images && product.images.length > 0) {
        const deletePromises = product.images.map(img =>
            deleteFileFromCloudinary(img.publicId).catch(e => {
                logger.warn("Cloudinary delete failed", { publicId: img.publicId, error: e.message });
            })
        );
        await Promise.all(deletePromises);
    }

    await productService.deleteProduct(id, req.user._id);

    return res.status(200).json(
        new ApiResponse(200, null, "Product deleted successfully")
    );
});

export const getCategories = asyncHandler(async (req, res) => {
    const categories = await productService.getCategories();

    return res.status(200).json(
        new ApiResponse(200, categories, "Categories fetched successfully")
    );
});

export const getFeaturedProducts = asyncHandler(async (req, res) => {
    const products = await productService.getFeaturedProducts();

    return res.status(200).json(
        new ApiResponse(200, products, "Featured products fetched successfully")
    );
});
