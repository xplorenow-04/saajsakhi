import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse, ApiError } from "../utils/apiUtils.js";
import { 
    getProductsService, 
    getProductByIdService, 
    createProductService, 
    updateProductService, 
    deleteProductService,
    getFeaturedProductsService
} from "../services/product.service.js";
import { uploadFileOnCloudinary } from "../services/cloudinary.service.js";

/**
 * Get all products with filters
 */
export const getProducts = asyncHandler(async (req, res) => {
    const data = await getProductsService(req.query);
    return res.status(200).json(
        new ApiResponse(200, data, "Products fetched successfully")
    );
});

/**
 * Get featured products
 */
export const getFeaturedProducts = asyncHandler(async (req, res) => {
    const data = await getFeaturedProductsService();
    return res.status(200).json(
        new ApiResponse(200, data, "Featured products fetched successfully")
    );
});

/**
 * Get product by ID
 */
export const getProductById = asyncHandler(async (req, res) => {
    const data = await getProductByIdService(req.params.id);
    return res.status(200).json(
        new ApiResponse(200, data, "Product details fetched successfully")
    );
});

/**
 * Create a new product (Admin only)
 */
export const createProduct = asyncHandler(async (req, res) => {
    const { name, description, category, price, discount, sizes, stock } = req.body;

    if (!name || !description || !category || !price || !sizes || stock === undefined) {
        throw new ApiError(400, "All product fields (name, description, category, price, sizes, stock) are required.");
    }

    // Parse sizes if they are sent as string (e.g. from FormData)
    let parsedSizes = sizes;
    if (typeof sizes === "string") {
        try {
            parsedSizes = JSON.parse(sizes);
        } catch (e) {
            parsedSizes = sizes.split(",").map(s => s.trim());
        }
    }

    // Handle uploaded images
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            const uploadRes = await uploadFileOnCloudinary(file.path);
            if (uploadRes && uploadRes.success) {
                imageUrls.push(uploadRes.secure_url);
            }
        }
    }

    const productData = {
        name,
        description,
        category,
        price: Number(price),
        discount: Number(discount || 0),
        sizes: parsedSizes,
        stock: Number(stock),
        images: imageUrls
    };

    const product = await createProductService(productData, req.user._id);

    return res.status(201).json(
        new ApiResponse(201, product, "Product created successfully")
    );
});

/**
 * Update an existing product (Admin only)
 */
export const updateProduct = asyncHandler(async (req, res) => {
    const { name, description, category, price, discount, sizes, stock, existingImages } = req.body;

    // Parse sizes if sent as string
    let parsedSizes = sizes;
    if (sizes && typeof sizes === "string") {
        try {
            parsedSizes = JSON.parse(sizes);
        } catch (e) {
            parsedSizes = sizes.split(",").map(s => s.trim());
        }
    }

    // Parse existing images (if any are retained)
    let parsedExistingImages = [];
    if (existingImages) {
        if (typeof existingImages === "string") {
            try {
                parsedExistingImages = JSON.parse(existingImages);
            } catch (e) {
                parsedExistingImages = [existingImages];
            }
        } else {
            parsedExistingImages = existingImages;
        }
    }

    // Handle new uploaded images
    const newImageUrls = [...parsedExistingImages];
    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            const uploadRes = await uploadFileOnCloudinary(file.path);
            if (uploadRes && uploadRes.success) {
                newImageUrls.push(uploadRes.secure_url);
            }
        }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (price !== undefined) updateData.price = Number(price);
    if (discount !== undefined) updateData.discount = Number(discount);
    if (parsedSizes) updateData.sizes = parsedSizes;
    if (stock !== undefined) updateData.stock = Number(stock);
    if (newImageUrls.length > 0 || req.files) updateData.images = newImageUrls;

    const product = await updateProductService(req.params.id, updateData);

    return res.status(200).json(
        new ApiResponse(200, product, "Product updated successfully")
    );
});

/**
 * Delete a product (Admin only)
 */
export const deleteProduct = asyncHandler(async (req, res) => {
    const result = await deleteProductService(req.params.id);
    return res.status(200).json(
        new ApiResponse(200, null, result.message)
    );
});
