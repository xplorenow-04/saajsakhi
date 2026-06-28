import { ApiError } from "../utils/apiUtils.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const adminAuth = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        throw new ApiError(401, "Authentication required");
    }

    if (req.user.role !== "admin") {
        throw new ApiError(403, "Access denied. Admin role required.");
    }

    next();
});
