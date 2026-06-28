import { Router } from "express";
import { 
    getCart, 
    addToCart, 
    updateCartItem, 
    removeFromCart, 
    clearCart 
} from "../controllers/cart.controller.js";
import { userAuth } from "../middlewares/userAuth.middleware.js";

const router = Router();

// All cart routes require user login
router.use(userAuth);

router.route("/").get(getCart);
router.route("/add").post(addToCart);
router.route("/update").put(updateCartItem);
router.route("/remove/:productId/:size").delete(removeFromCart);
router.route("/clear").delete(clearCart);

export default router;
