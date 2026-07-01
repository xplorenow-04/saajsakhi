import mongoose, { isValidObjectId } from "mongoose"
import { ApiError } from "../utils/apiUtils.js"
import { isUserExists } from "../utils/document existance check/user.js"
import { Notification } from "../models/notification.model.js"
import { getGroupMembers } from "../sockets/utils/getGroupMembers.js"

/**
 * @description Service for Creating new notification
 * @access User
 * @param {ObjectId} senderId 
 * @param {Array} receivers 
 * @param {String} type 
 * @param {ObjectId} entityId 
 * @param {Boolean} isGroupNotification 
 * @param {String} content 
 * @param {String} renderUrl
 * @returns Notification Object
 */
const createNotificationService = async (senderId, currentUserId, receivers = [], type, entityId, isGroupNotification = false, content, renderUrl = "") => {

    const sender = await isUserExists(senderId)
    let groupMembers = []

    if ([type, content].some(field => !field || field && field.trim() === "")) {
        throw new ApiError(400, "Type and Content are Required Fields.")
    }

    if (entityId && !isValidObjectId(entityId)) {
        throw new ApiError(400, "Invalid Entity Id.")
    }

    if (isGroupNotification && !receivers.length) {
        receivers = await getGroupMembers(entityId)
    }

    if (!isGroupNotification && !receivers.length) {
        receivers = [currentUserId]
    }

    if (!receivers.length) {
        throw new ApiError(400, "No receivers found")
    }

    receivers = receivers.filter(id => id.toString() !== senderId.toString())

    const newNotification = await Notification.create({
        sender: sender._id,
        receivers: receivers,
        entity: entityId,
        type,
        isGroupNotification,
        content,
        renderUrl
    })

    if (!newNotification) {
        throw new ApiError(404, "Error While Creating Notification.")
    }

    for (const receiverId of receivers) {
        const receiver = await isUserExists(receiverId)
        receiver.isUnreadNotification = true
        await receiver.save({validateBeforeSave: false})
    }

    // if (newNotification.isGroupNotification) {
    //     return { newNotification, groupMembers };
    // }

    return newNotification;
}

/**
 * @description Service to fetch all user notifications reguardless of read status.
 * @access User
 * @param {ObjectId} userId 
 * @returns Array of notifications
 */
const getUserNotificationsService = async (userId) => {

    const user = await isUserExists(userId)

    const notifications = await Notification.aggregate([
        {
            $match: {
                receivers: {
                    $in: [
                        new mongoose.Types.ObjectId(userId)
                    ]
                },
                // isRead: {
                //     $ne: true
                // }
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $lookup: {
                from: "requests",
                localField: "entity",
                foreignField: "_id",
                as: "requestDetails",
            }
        },
        {
            $match: {
                $or: [
                    { entity: null },
                    { "requestDetails.status": "pending" }
                ]
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "sender",
                foreignField: "_id",
                as: "sender"
            }
        },
        {
            $addFields: {
                sender: { $arrayElemAt: ["$sender", 0] }
            }
        },
        {
            $project: {
                readBy: 0,
                "sender.password": 0,
                "sender.refreshToken": 0,
                "sender.email": 0
            }
        }
    ])

    let count = await Notification.countDocuments({
        isRead: {
            $ne: true
        },
        receivers: {
            $in: [user._id]
        }
    })

    // if(!user.isUnreadNotification ){
    // return { notifications:[], count:0 };
    // }
    return { notifications, count }

}

const markAllNotificationsAsReadService = async (userId,count)=>{

    const user = await isUserExists(userId)

    const notifications = await Notification.updateMany(
        {
            receivers: { $in: [user._id] },
            isRead: { $ne: true }
        },
        { isRead: true }
    )

    return notifications

}

export {
    createNotificationService,
    getUserNotificationsService,
    markAllNotificationsAsReadService
}