import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, ApiResponse } from "../utils/apiUtils.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendVerificationToken } from "../services/sendVerificationToken.js";
import { generateTokens } from "../services/generateTokens.js";
import { deleteFileFromCloudinary, uploadFileOnCloudinary } from "../services/cloudinary.service.js";
import { generateOTP } from "../services/generateOTP.js";
import { sendEmail } from "../services/brevoMail.service.js";
import { Chat } from "../models/chat.model.js";
import { getIO } from "../sockets/socketInstance.js";
import { socketEvents } from "../constants/socketEvents.js";
import { validateAtleastOneField } from "../utils/fields validations/validateAtleastOneField.js";
import { isChatExists } from "../utils/document existance check/chat.js";
import { getUserChatUsers, getUserChatUsersServer } from "./chat.controller.js";
import { getUniqueMembers } from "../utils/getUniqueMembers.js";
import { addMembertoGroupService, markMemberAsAdminService, unmarkMemberAsAdminService } from "../services/group.service.js";
import { createNotificationService, getUserNotificationsService, markAllNotificationsAsReadService } from "../services/notification.service.js";

/**
 * @description Controller for Creating new notification
 * @access User
 * @method POST
 */
const createNotification = asyncHandler(async (req, res) => {

    const {
        receiverId,
        type,
        entityId,
        isGroupChatNotification,
        content,
        renderUrl
    } = req.body

    const newNotification = await createNotificationService(req.user._id, req.user._id, [receiverId], type, entityId, isGroupChatNotification, content, renderUrl)

    // Emit Socket Event Here
    if (isGroupChatNotification) {

    }

    return res
        .status(201)
        .json(
            new ApiResponse(201, newNotification, "New Notification Created Successfully.")
        )

})

/**
 * @description Controller for fetching all notifications of User
 * @access User
 * @method GET 
 */
const getAllUserNotifications = asyncHandler(async (req, res) => {

    const notifications = await getUserNotificationsService(req.user._id)

    return res
        .status(200)
        .json(
            new ApiResponse(200, notifications, "User notifications fetched Successfully.")
        )

})

const markAllNotificationsAsRead = asyncHandler(async(req,res)=>{

   const count = req.body?.count || 0
   
    if(!count){
         return res
        .status(200)
        .json(
            new ApiResponse(200, null, "All notifications marked as read.")
        )
    }

    const isMarked = await markAllNotificationsAsReadService(req.user._id,count)

    return res
        .status(200)
        .json(
            new ApiResponse(200, null, "All notifications marked as read.")
        )
})

export {
    getAllUserNotifications,
    createNotification,
    markAllNotificationsAsRead
}