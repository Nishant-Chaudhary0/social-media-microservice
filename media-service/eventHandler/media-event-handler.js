import Media from "../src/models/media.js";
import { deleteFromCloudinary } from "../src/utils/cloudinary.js";
import logger from "../src/utils/logger.js";

export const handlePostDelete = async (event) => {
    try {
        logger.info(`Post delete event received: ${JSON.stringify(event)}`);

        const { postId, mediaIds } = event;

        if (!mediaIds || mediaIds.length === 0) {
            logger.warn(`No media found for deleted post ${postId}`);
            return;
        }

        const mediaToDelete = await Media.find({ _id: { $in: mediaIds } });

        for (const media of mediaToDelete) {
            await deleteFromCloudinary(media.publicId);
            await Media.findByIdAndDelete(media._id);

            logger.info(`Deleted media ${media._id} for post ${postId}`);
        }

    } catch (error) {
        logger.error("Error while deleting media:", error);
    }
};