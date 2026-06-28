import { Router } from "express";
import { 
    getProducts, 
    getFeaturedProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} from "../controllers/product.controller.js";
import { userAuth } from "../middlewares/userAuth.middleware.js";
import { adminAuth } from "../middlewares/admin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getProducts);
router.route("/featured").get(getFeaturedProducts);
router.route("/:id").get(getProductById);

// Admin routes
router.route("/").post(userAuth, adminAuth, upload.array("images", 5), createProduct);
router.route("/:id").put(userAuth, adminAuth, upload.array("images", 5), updateProduct);
router.route("/:id").delete(userAuth, adminAuth, deleteProduct);

export default router;
