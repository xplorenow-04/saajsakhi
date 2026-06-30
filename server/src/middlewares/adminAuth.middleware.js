import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiUtils.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const adminAuth = asyncHandler(async (req, res, next) => {
    const { accessToken } = req.cookies;

    if (!accessToken || accessToken.trim() === "") {
        throw new ApiError(401, "Unauthorized");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
        throw new ApiError(401, "Invalid access token");
    }

    const user = await User.findById(decodedToken._id).select("-password");

    if (!user) {
        throw new ApiError(401, "User not found");
    }

    if (user.role !== "admin") {
        throw new ApiError(403, "Admin access required");
    }

    req.user = user;
    next();
});
