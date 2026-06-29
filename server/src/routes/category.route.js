import { Router } from "express";
import {
    getAllCategories,
    createCategory,
    deleteCategory
} from "../controllers/category.controller.js";
import { userAuth } from "../middlewares/userAuth.middleware.js";
import { adminAuth } from "../middlewares/admin.middleware.js";

const router = Router();

router.route("/").get(getAllCategories);
router.route("/").post(userAuth, adminAuth, createCategory);
router.route("/:id").delete(userAuth, adminAuth, deleteCategory);

export default router;
