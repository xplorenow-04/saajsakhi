import { Router } from "express";
import { adminAuth } from "../middlewares/adminAuth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    createCategory,
    getCategories,
    getCategory,
    getCategoryBySlug,
    updateCategory,
    deleteCategory
} from "../controllers/category.controller.js";

const router = Router();

router.get("/", getCategories);
router.get("/by-slug/:slug", getCategoryBySlug);

router.use(adminAuth);

router.post("/", upload.single("image"), createCategory);
router.get("/:id", getCategory);
router.put("/:id", upload.single("image"), updateCategory);
router.delete("/:id", deleteCategory);

export default router;
