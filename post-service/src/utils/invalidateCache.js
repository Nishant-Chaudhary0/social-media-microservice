export const invalidateCache = async (req, postId) => {
    try {
        // Delete single post cache
        const cacheKey = `post:${postId}`;
        await req.redisClient.del(cacheKey);

        // Delete paginated posts cache
        const keys = await req.redisClient.keys("posts:*");

        if (keys.length > 0) {
            await req.redisClient.del(...keys);
        }

        console.log("Cache invalidated successfully");
    } catch (error) {
        console.error("Cache invalidation failed:", error.message);
    }
};