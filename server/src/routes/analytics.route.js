import { Router } from "express";
import { getDashboardAnalytics } from "../controllers/analytics.controller.js";
import { userAuth } from "../middlewares/userAuth.middleware.js";
import { adminAuth } from "../middlewares/admin.middleware.js";

const router = Router();

router.route("/dashboard").get(userAuth, adminAuth, getDashboardAnalytics);

export default router;
