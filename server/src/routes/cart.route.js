import { Router } from "express";
import { userAuth } from "../middlewares/userAuth.middleware.js";
import { validate } from "../utils/validate.js";
import { addToCartSchema, updateCartItemSchema } from "../validators/ecommerce.validator.js";
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from "../controllers/cart.controller.js";

const router = Router();

router.use(userAuth);

router.get("/", getCart);
router.post("/", validate(addToCartSchema), addToCart);
router.put("/:itemId", validate(updateCartItemSchema), updateCartItem);
router.delete("/:itemId", removeFromCart);
router.delete("/", clearCart);

export default router;
