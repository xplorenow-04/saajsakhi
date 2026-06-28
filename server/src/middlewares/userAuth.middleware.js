import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiUtils.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { generateTokens } from "../services/generateTokens.js";
import dotenv from "dotenv"

dotenv.config({path:"./.env"})

const userAuth = asyncHandler(async (req, res, next) => {
    const { accessToken, refreshToken } = req.cookies;

    // Helper to clear cookies and throw auth error
    const clearAndThrow = (message, status = 401) => {
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        });
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        });
        throw new ApiError(status, message);
    };

    if (!accessToken || accessToken.trim() === "") {
        // If accessToken is missing, try token refresh flow
        if (refreshToken && refreshToken.trim() !== "") {
            return await handleTokenRefresh(refreshToken, req, res, next, clearAndThrow);
        }
        if (req.headers["x-auth-check-type"] && req.headers["x-auth-check-type"] === "login-check-hit") {
            return res.status(200).json({ success: false, isLoggedIn: false });
        }
        throw new ApiError(401, "Unauthorized User");
    }

    try {
        const decodedToken = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
        const user = await User.findById(decodedToken._id).select("-password");
        if (!user) {
            return clearAndThrow("User not found");
        }
        if (user.isDisabled) {
            return clearAndThrow("Your account has been disabled. Please contact support.", 403);
        }
        req.user = user;
        return next();
    } catch (error) {
        // Access token is invalid/expired. Try refresh flow
        if (refreshToken && refreshToken.trim() !== "") {
            return await handleTokenRefresh(refreshToken, req, res, next, clearAndThrow);
        }
        return clearAndThrow("Unauthorized. Access Token is invalid or expired.");
    }
});

const handleTokenRefresh = async (token, req, res, next, clearAndThrow) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_ACCESS_SECRET);
        const user = await User.findById(decoded._id);
        
        if (!user || user.refreshToken !== token) {
            // Token reuse attack or token revoked
            if (user) {
                user.refreshToken = undefined;
                await user.save({ validateBeforeSave: false });
            }
            return clearAndThrow("Suspicious activity detected. Session terminated.", 401);
        }

        if (user.isDisabled) {
            return clearAndThrow("Your account has been disabled. Please contact support.", 403);
        }

        // Generate new tokens
        const tokens = generateTokens(user);
        user.refreshToken = tokens.refreshToken;
        await user.save({ validateBeforeSave: false });

        // Set cookies
        res.cookie("accessToken", tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });
        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 90 * 24 * 60 * 60 * 1000 // 90 days
        });

        const cleanUser = await User.findById(user._id).select("-password -refreshToken");
        req.user = cleanUser;
        return next();
    } catch (err) {
        return clearAndThrow("Session expired. Please login again.");
    }
};

export { userAuth }