import { Router } from "express";
import { 
    placeOrder, 
    getMyOrders, 
    getAllOrders, 
    updateOrderStatus 
} from "../controllers/order.controller.js";
import { userAuth } from "../middlewares/userAuth.middleware.js";
import { adminAuth } from "../middlewares/admin.middleware.js";

const router = Router();

// Customer routes (require userAuth)
router.route("/place").post(userAuth, placeOrder);
router.route("/my-orders").get(userAuth, getMyOrders);

// Admin routes (require userAuth + adminAuth)
router.route("/all").get(userAuth, adminAuth, getAllOrders);
router.route("/status/:orderId").put(userAuth, adminAuth, updateOrderStatus);

export default router;
