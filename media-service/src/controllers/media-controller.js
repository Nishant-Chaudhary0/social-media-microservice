import Media from "../models/media.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import logger from "../utils/logger.js";

export const uploadMedia = async(req, res) => {
    logger.info("upload media endpoint hit");

    try {
         console.log(req.file, "req.filereq.file");
        if(!req.file){
            logger.warn("No file detected, Please upload one");
            return res.status(404).json({
                success: false,
                message: "No file detected, Please upload one"
            })
        } 

        const {originalname, mimetype, buffer} = req.file;
        const userId = req.user.userId;
        logger.info(`file details: name = ${originalname}, type = ${mimetype}`);
        logger.info("uploading to cloudinary started");

        const cloudinaryUploadResult = await uploadCloudinary(req.file);
        logger.info(`successfully uploaded to cloudinary,PublicId : ${cloudinaryUploadResult.public_id}`);

        const newlyCreatedMedia = new Media({
            publicId: cloudinaryUploadResult.public_id,
            originalName: originalname,
            mimeType: mimetype,
            url: cloudinaryUploadResult.secure_url,
            userId
        })

        await newlyCreatedMedia.save()

        res.status(201).json({
            success: true,
            mediaId:  newlyCreatedMedia._id,
            url: newlyCreatedMedia.url, 
            message: "media uploaded successfully"
        })
    } catch (error) {
        logger.error("Error creating media", error);
    res.status(500).json({
      success: false,
      message: "Error creating media",
    });
    }
}