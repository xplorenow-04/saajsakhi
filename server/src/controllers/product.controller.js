import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiUtils.js";
import { productService } from "../services/product.service.js";
import { uploadFileOnCloudinary, deleteFileFromCloudinary } from "../services/cloudinary.service.js";
import { logger } from "../utils/logger.js";
import fs from "fs";

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

export const createProduct = asyncHandler(async (req, res) => {
    const productData = req.body;
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
    const product = await productService.getProductBySlug(slug);

    await productService.incrementViewCount(product._id);

    return res.status(200).json(
        new ApiResponse(200, product, "Product fetched successfully")
    );
});

export const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;
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
    const updateData = req.body;

    if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map(file => compressAndUpload(file.path));
        const results = await Promise.all(uploadPromises);
        updateData.images = results.filter(Boolean);
    }

    const product = await productService.updateProduct(id, updateData, req.user._id);

    return res.status(200).json(
        new ApiResponse(200, product, "Product updated successfully")
    );
});

export const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
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
