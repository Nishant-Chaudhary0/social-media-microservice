import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
    logger.warn(err.stack);

    return res.status(500).json({
        success: false,
        message: "Internal server error"
    })
}

export default errorHandler;