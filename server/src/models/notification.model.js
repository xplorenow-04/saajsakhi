import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema({

    sender: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    receivers: [{
        type: mongoose.Types.ObjectId,
        ref: "User"
    }],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    entity: {
        type: mongoose.Types.ObjectId,
        default: null
    },
    type: {
        type: String,
        required: true
    },
    isGroupNotification: {
        type: Boolean,
        default: false
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readStatus: {
        type: Boolean,
        default: false
    },
    isRequest: {
        type: Boolean,
        default: false
    },
    content: {
        type: String,
        required: true
    },
    message: {
        type: String
    },
    renderUrl: {
        type: String
    },
    readBy: [                // For shared notifications (group)
        {
            type: mongoose.Types.ObjectId,
            ref: "User"
        }
    ]

}, { timestamps: true })

notificationSchema.index({ receiver: 1, createdAt: -1 })
notificationSchema.index({ readBy: 1 })

export const Notification = mongoose.model("Notification", notificationSchema)