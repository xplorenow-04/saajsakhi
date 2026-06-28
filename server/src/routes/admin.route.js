import { Router } from "express";
import { adminAuth } from "../middlewares/adminAuth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    getDashboard,
    getOrders,
    updateOrderStatus,
    deleteOrder,
    getUsers,
    toggleUserStatus,
    deleteUser,
    getAnalytics,
    createAdmin,
    getProductAnalytics,
    seedProducts
} from "../controllers/admin.controller.js";
import {
    createProduct,
    listProducts,
    updateProduct,
    deleteProduct
} from "../controllers/product.controller.js";
import { createProductSchema } from "../validators/ecommerce.validator.js";

const router = Router();

router.post("/create", createAdmin);

router.use(adminAuth);

router.get("/dashboard", getDashboard);
router.get("/analytics", getAnalytics);
router.get("/product-analytics", getProductAnalytics);

router.get("/orders", getOrders);
router.put("/orders/:orderId/status", updateOrderStatus);
router.delete("/orders/:id", deleteOrder);

router.get("/users", getUsers);
router.put("/users/:id/toggle-status", toggleUserStatus);
router.delete("/users/:id", deleteUser);

router.get("/products", listProducts);

router.post("/seed", seedProducts);

export default router;
