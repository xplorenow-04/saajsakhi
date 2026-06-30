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
    adminListProducts,
    seedProducts,
    exportOrdersPDF
} from "../controllers/admin.controller.js";
import {
    createProduct,
    updateProduct,
    deleteProduct
} from "../controllers/product.controller.js";
import { createManualOrder } from "../controllers/order.controller.js";

const router = Router();

router.post("/create", createAdmin);

router.use(adminAuth);

router.get("/dashboard", getDashboard);
router.get("/analytics", getAnalytics);
router.get("/product-analytics", getProductAnalytics);

router.get("/orders", getOrders);
router.get("/orders/export-pdf", exportOrdersPDF);
router.put("/orders/:orderId/status", updateOrderStatus);
router.delete("/orders/:id", deleteOrder);
router.post("/orders/manual", createManualOrder);

router.get("/users", getUsers);
router.put("/users/:id/toggle-status", toggleUserStatus);
router.delete("/users/:id", deleteUser);

router.get("/products", adminListProducts);
router.post("/products", upload.array("images", 5), createProduct);
router.put("/products/:id", upload.array("images", 5), updateProduct);
router.delete("/products/:id", deleteProduct);

router.post("/seed", seedProducts);

export default router;
