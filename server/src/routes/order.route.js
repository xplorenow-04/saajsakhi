import { Router } from "express";
import { userAuth } from "../middlewares/userAuth.middleware.js";
import {
    placeOrder,
    placeGuestOrder,
    getOrder,
    getUserOrders,
    cancelOrder
} from "../controllers/order.controller.js";

const router = Router();

router.post("/guest", placeGuestOrder);

router.use(userAuth);

router.post("/", placeOrder);
router.get("/", getUserOrders);
router.get("/:orderId", getOrder);
router.post("/:orderId/cancel", cancelOrder);

export default router;
