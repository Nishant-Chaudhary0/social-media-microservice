import post from "../models/post.js";
import logger from "../utils/logger.js";

export const createPost = async (req, res) => {
    logger.info("post endpoint hit");
    try {
        const { content, mediaIds } = req.body;

        if (!content) {
            logger.warn("content is not provided");
            return res.status(400).json({
                success: false,
                message: "content is not provided"
            })
        }

        const newPost = new post({
            user: req.user.userId,
            content,
            mediaIds: mediaIds || []});
        await newPost.save();

        logger.info("new post created successfully");
        res.status(201).json({
            success: true,
            message: "Post created successfully"
        })

    } catch (error) {
        logger.warn("failed creating post");
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const getAllPosts = async(req, res) => {
    logger.info("getAllpost endpoint hit")
    try {
        
    } catch (error) {
        
    }
};

export const getPost = async(req, res) => {
    try {
        
    } catch (error) {
        
    }
}

export const deletePost = async(req, res) => {
    try {
        
    } catch (error) {
        
    }
};