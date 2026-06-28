import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})



/**
 * @description utility function for cloudinary file upload service 
 * 
 * @param {String} localFilePath
 * @param {String} resourceType - default (auto)
 * 
 * @returns response Object {uploadInfo , success:true/false}
 */

const uploadFileOnCloudinary = async function(localFilePath, resourceType="auto"){
    try {
        if(!localFilePath) return null

        const uploadInfo = await cloudinary.uploader.upload(localFilePath, {
            resource_type: resourceType,
            format: "webp",
            transformation: [
                { width: 1200, height: 1200, crop: "limit" },
                { quality: "auto" }
            ]
        })

        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        console.log("File Uploaded Successfully to Cloudinary", uploadInfo.secure_url)
        return {...uploadInfo, success:true};

    } catch (error) {
        console.error("Upload to Cloudinary failed:", error);
        if (localFilePath && fs.existsSync(localFilePath)) {
            try {
                fs.unlinkSync(localFilePath);
            } catch (err) {
                console.error("Failed to delete temp file:", err.message);
            }
        }
        return {
            success:false,
            message:"Upload failed",
            error:error.message
        };
    }
}

const deleteFileFromCloudinary = async function(publicId,resourceType = "image"){
    try {
        const result = await cloudinary.uploader.destroy(publicId,{resource_type:resourceType})

        if(result.result !== "ok" && result.result !== "not found"){
            throw new Error("Cloudinary Deletion Failed")
        }

        console.log(result)
        return result

    } catch (error) {
        return {
            success:false,
            message:"deletion from cloudinary failed"
        }
    }
}


export {
    uploadFileOnCloudinary,
    deleteFileFromCloudinary
}
