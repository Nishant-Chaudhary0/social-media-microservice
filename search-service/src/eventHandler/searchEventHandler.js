import Search from "../models/search";
import logger from "../utils/logger";

export const addToSearch = async(event) => {
    try {

        const newSearch = new Search({
            postId: event.postId,
            userId: event.userId,
            content: event.content,
            createdAt: event.createdAt
        })

        await newSearch.save();

        logger.info(`search post created at : ${event.postId}, ${newSearch._id.toString()}`);
    } catch (error) {
        logger.error("error while saving search event", error);
    }
}