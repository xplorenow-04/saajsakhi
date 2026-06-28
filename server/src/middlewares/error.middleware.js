import { ApiError } from "../utils/apiUtils.js";

export const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let errorCode = err.errorCode || "INTERNAL_SERVER_ERROR";
    let details = err.details || {};

    // For Mongoose Validation Errors
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Validation Error";
        errorCode = "VALIDATION_ERROR";
        details = Object.keys(err.errors).reduce((acc, key) => {
            acc[key] = err.errors[key].message;
            return acc;
        }, {});
    }

    // For JWT Errors
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid Token";
        errorCode = "INVALID_TOKEN";
    }
    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Expired Token";
        errorCode = "TOKEN_EXPIRED";
    }

    // Safe error logging
    console.error(`[${new Date().toISOString()}] Error ${statusCode}: ${message}`, err);

    return res.status(statusCode).json({
        success: false,
        message,
        errorCode,
        details
    });
};
