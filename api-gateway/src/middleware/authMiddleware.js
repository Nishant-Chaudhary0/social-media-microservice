import logger from "../utils/logger.js";
import jwt from 'jsonwebtoken';

const validateToken = (req, res, next) => {
    const authheader = req.headers.authorization;

    const token = authheader && authheader.split(" ")[1];

    if (!token) {
        logger.warn("valid token required");
        return res.status(401).json({
            success: false,
            message: "valid token required"
        })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if(err){
            logger.warn("Token not valid");
        return res.status(403).json({
            success: false,
            message: "Token not valid"
        })
        }

        req.user = user;
        next();
    })
}

export default validateToken;