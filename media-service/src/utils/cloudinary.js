import { v2 as cloudinary } from "cloudinary";
import logger from "./logger.js";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

export const uploadCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: "auto"
            },
            (error, result) => {
                if(error) {
                    logger.warn("Error while uploading media to cloudinary", error);
                    reject(error);
                }else{
                    resolve(result);
                }
            }
        )
        uploadStream.end(file.buffer);
    })
}

export const deleteFromCloudinary = async(publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        logger.info("image deleted successfully from cloudinary")
    } catch (error) {
        logger.error("error deleting image from cloudinary")
        throw error;
    }
}