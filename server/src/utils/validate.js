import { ApiError } from "./apiUtils.js";

export const validate = (schema) => (req, res, next) => {
    try {
        const parsed = schema.parse(req.body);
        req.body = parsed;
        next();
    } catch (error) {
        if (error?.issues) {
            const details = error.issues.map(i => ({
                field: i.path.join("."),
                message: i.message
            }));
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                details
            });
        }
        next(new ApiError(400, error.message || "Validation failed"));
    }
};
