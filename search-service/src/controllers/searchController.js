import Search from "../models/search.js";
import logger from "../utils/logger.js";

export const searchController = async(req, res) => {
    logger.info("Search endpoint hit");

    try {
        const {query} = req.query;

        const result = await Search.find({
            $text: { $search: query}
        },
    {
        score: {$meta : "textScore"}
    }).sort({score: {$meta : "textScore"}}).limit(10);

    res.json(result);
    } catch (error) {
        logger.error("Error while searching post");

        res.status(500).json({
            success: false,
            message: "Error while searching post"
        })
    }
}