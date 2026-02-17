import { validateSchema, validateLogin  } from "../utils/validation.js";
import User from "../models/user.js";
import generateToken from "../utils/generateToken.js";
import logger from "../utils/logger.js";
import Token from "../models/refreshToken.js";

export const registerUser = async (req, res) => {
    logger.info("registration endpoint hit...");
    try {
        // Validate the request body
        const { error } = validateSchema(req.body);
        if (error) {
            logger.warn("Validation error:", error.details[0].message);
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { username, email, password } = req.body;

        // Check if the user already exists
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            logger.warn("User already exists with the given email or username");
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Create a new user
        user = new User({ username, email, password });
        await user.save();
        logger.info("User created successfully", user._id);

        // Generate tokens
        const { accessToken, refreshToken } = await generateToken(user);

        // Respond with tokens
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            accessToken,
            refreshToken,
        });
    } catch (error) {
        logger.error("Registration error occurred:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const loginUser = async (req, res) => {
    logger.info("Login endpoint hit...");
    try {
        const { error } = validateLogin(req.body);

        if (error) {
            logger.warn("Validation error:", error.details[0].message);
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const isValidPassword = await user.comparePassword(password);

        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const { accessToken, refreshToken } = await generateToken(user);

        res.json({
            accessToken,
            refreshToken,
            userId: user._id
        });

    } catch (error) {
        logger.error("Login error occurred:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



export const refreshTokenUser = async (req, res) => {
    logger.info("refresh token endpoint hit");

    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "refresh token missing"
            });
        }

        const storedToken = await Token.findOne({ token: refreshToken });

        if (!storedToken || storedToken.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Invalid refresh token"
            });
        }

        const user = await User.findById(storedToken.user);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        const { accessToken, refreshToken: newRefreshToken } =
            await generateToken(user);

        await Token.deleteOne({ _id: storedToken._id });

        res.json({
            accessToken,
            refreshToken: newRefreshToken
        });

    } catch (error) {
        logger.error("Refresh token error occurred", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


export const logoutUser = async(req, res) => {
    logger.info("logout endpoint hit");
    try {
        const {refreshToken} = req.body;
        if(!refreshToken){
            logger.warn("refresh token not found");
            return res.status(400).json({
                success: false,
                message: "refresh token not found"
            })
        }

        const storedToken = await refreshToken.findOneAndDelete({token: refreshToken});

        if(!storedToken){
            logger.warn("Invalid refresh token provided");
            return res.status(400).json({
                success: false,
                message: "Invalid refresh token provided"
            })
        }

        logger.warn("Refresh token deleted for logout");

        res.json({
            success: true,
            message: "logged out successfully"
        });
    } catch (error) {
        logger.error("Error while logging out", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    }
}