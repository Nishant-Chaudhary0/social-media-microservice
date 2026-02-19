export const invalidateCache = async(req, object) => {
    const cacheKey = `post:${input}`;
    await req.redisClient.del(cacheKey)

    const keys = await req.redisClient.keys("posts:*");
    if(keys.lenght > 0){
        await req.redisClient.del(keys);
    }
}