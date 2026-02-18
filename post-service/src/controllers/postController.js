import post from "../models/post.js";
import logger from "../utils/logger.js";

export const createPost = async (req, res, next) => {
    logger.info("Post endpoint hit");

    try {
        const { content, mediaIds } = req.body;

        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (!content) {
            logger.warn("Content is not provided");
            return res.status(400).json({
                success: false,
                message: "Content is required"
            });
        }

        const newPost = new post({
            user: req.user.userId,
            content,
            mediaIds: mediaIds || []
        });

        await newPost.save();

        logger.info("New post created successfully");

        res.status(201).json({
            success: true,
            message: "Post created successfully",
            data: newPost
        });

    } catch (error) {
        logger.error("Failed creating post:", error.message);
        next(error);
    }
};

export const getAllPosts = async(req, res) => {
    logger.info("getAllpost endpoint hit")
    try {
        const allPosts = (await post.find()).sort({createdAt:-1});

        res.status(200).json({
            success: true,
            message: "All of the posts"
        })
        logger.info("Posts retrieved successfully")
    } catch (error) {
        logger.warn("failed creating post");
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
};

export const getPost = async(req, res) => {
    try {
        const {id} = req.params;

        const userPosts = post.findById(id);

        if(!post){
            logger.warn("No posts found for user");
            return res.status(400).json({
                success: false,
                message: "No posts found for user"
            })
        }

        res.status(200).json({
            success: true,
            message: "Post retrieved sucessfully"
        })
    } catch (error) {
        logger.warn("failed creating post");
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const deletePost = async(req, res) => {
    try {
        await post.findOneAndDelete
    } catch (error) {
        
    }
};