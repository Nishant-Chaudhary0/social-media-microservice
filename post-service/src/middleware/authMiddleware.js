import logger from "../utils/logger";

export const authenticateRequest = (req, res) => {
    const userId = req.header['x-user-id'];

    if(!userId) {
        logger.warn("Access attempted without user ID");
        return res.status(400).json({
            success: false,
            message: "Authentication required please log in"
        })
    }
}

