import { Router } from "express";
import {
    getProduct,
    getProductById,
    listProducts,
    getCategories,
    getFeaturedProducts
} from "../controllers/product.controller.js";

const router = Router();

router.get("/", listProducts);
router.get("/categories", getCategories);
router.get("/featured", getFeaturedProducts);
router.get("/slug/:slug", getProduct);
router.get("/:id", getProductById);

export default router;
