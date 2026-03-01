import post from "../models/post.js";
import logger from "../utils/logger.js";
import { invalidateCache } from "../utils/invalidateCache.js";
import {publishEvent} from "../utils/rabbitMQ.js"

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

        await publishEvent('post.created',{
            postId: newPost._id.toString(),
            userId: newPost.user.toString(),
            content: newPost.content,
            createdAt: newPost.createdAt
        })
        await invalidateCache(req, newPost._id.toString());

        logger.info("New post created successfully");

        res.status(201).json({
            success: true,
            message: "Post created successfully",
            data: newPost,
            mediaIds: mediaIds
        });

    } catch (error) {
        logger.error("Failed creating post:", error.message);
        next(error);
    }
};

export const getAllPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;

        const cacheKey = `posts:${page}:${limit}`;

        // ✅ Correct GET
        const cachedPosts = await req.redisClient.get(cacheKey);

        if (cachedPosts) {
            return res.json(JSON.parse(cachedPosts));
        }

        const allPosts = await post.find({})
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        const totalNumberOfPosts = await post.countDocuments();

        const result = {
            allPosts,
            currentPage: page,
            totalPages: Math.ceil(totalNumberOfPosts / limit),
            totalPosts: totalNumberOfPosts
        };

        // ✅ Correct SET with expiry
        await req.redisClient.set(
  cacheKey,
  JSON.stringify(result),
  "EX",
  300
);

        res.json(result);

    } catch (error) {
        logger.warn("failed getting post");
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const getPost = async (req, res) => {
    try {
        const { id } = req.params.id;
        const cachekey = `post:${id}`;
        const cachedPost = await res.redisClient.get(cachekey);

        if (cachekey) {
            return res.json(JSON.parse(cachedPost));
        }

        const userPost = await post.findById(id);

        if (!userPost) {
            logger.warn("No posts found for user");
            return res.status(404).json({
                success: false,
                message: "No post found for user"
            })
        }

        await req.redisClient.setex(cachekey, 3600, JSON.stringify(userPost))
        res.status(200).json({
            userPost,
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

export const deletePost = async (req, res) => {
    try {
        const delPost = await post.findOneAndDelete({
            _id: req.params.id,
            user: req.user.userId
        });

        if (!delPost) {
            return res.status(404).json({
                success: false,
                message: "Post not found for deleting"
            });
        }

        console.log("Deleted Post Document:", delPost);

        await publishEvent("post.delete", {
            postId: delPost._id,
            userId: req.user.userId,
            mediaIds: delPost.mediaIds
        });

        console.log(delPost._id)

        await invalidateCache(req, req.params.id);

        logger.info("Post deleted and event published");

        res.json({
            success: true,
            message: "Post deleted successfully"
        });

    } catch (error) {
        logger.error("Failed deleting post:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};