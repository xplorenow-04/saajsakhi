import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiUtils.js";
import { getDashboardAnalyticsService } from "../services/analytics.service.js";

/**
 * Get store administration analytics (Admin only)
 */
export const getDashboardAnalytics = asyncHandler(async (req, res) => {
    const data = await getDashboardAnalyticsService();
    return res.status(200).json(
        new ApiResponse(200, data, "Dashboard analytics fetched successfully")
    );
});
