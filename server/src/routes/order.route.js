import { Router } from "express";
import { userAuth } from "../middlewares/userAuth.middleware.js";
import { validate } from "../utils/validate.js";
import { placeOrderSchema } from "../validators/ecommerce.validator.js";
import {
    placeOrder,
    getOrder,
    getUserOrders,
    cancelOrder
} from "../controllers/order.controller.js";

const router = Router();

router.use(userAuth);

router.post("/", validate(placeOrderSchema), placeOrder);
router.get("/", getUserOrders);
router.get("/:orderId", getOrder);
router.post("/:orderId/cancel", cancelOrder);

export default router;
