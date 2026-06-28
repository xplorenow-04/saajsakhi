import { Router } from "express";
import { userAuth } from "../middlewares/userAuth.middleware.js";
import { adminAuth } from "../middlewares/adminAuth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { validate } from "../utils/validate.js";
import { createProductSchema, updateProductSchema } from "../validators/ecommerce.validator.js";
import {
    createProduct,
    getProduct,
    getProductById,
    listProducts,
    updateProduct,
    deleteProduct,
    getCategories,
    getFeaturedProducts
} from "../controllers/product.controller.js";

const router = Router();

router.get("/", listProducts);
router.get("/categories", getCategories);
router.get("/featured", getFeaturedProducts);
router.get("/slug/:slug", getProduct);
router.get("/:id", getProductById);

const validateProduct = (schema) => (req, res, next) => {
    try {
        let data = {};
        if (req.body.data) {
            data = JSON.parse(req.body.data);
        } else {
            data = { ...req.body };
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
            if (data.isActive !== undefined && data.isActive !== null) {
                if (typeof data.isActive === "string") {
                    data.isActive = data.isActive === "true";
                } else {
                    data.isActive = Boolean(data.isActive);
                }
            }
        }

        req.body = schema.parse(data);
        next();
    } catch (e) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            details: e.issues ? e.issues.map(i => ({ field: i.path.join("."), message: i.message })) : [{ message: e.message }]
        });
    }
};

router.post("/",
    adminAuth,
    upload.array("images", 5),
    validateProduct(createProductSchema),
    createProduct
);

router.put("/:id",
    adminAuth,
    upload.array("images", 5),
    validateProduct(updateProductSchema),
    updateProduct
);

router.delete("/:id", adminAuth, deleteProduct);

export default router;
