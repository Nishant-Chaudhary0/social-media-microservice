import User from "../models/user";
import logger from "../utils/logger";
import validateSchema from "../utils/validation";

const registerUser = async(req, res) => {
    logger.info('registration endpoint hit...');
    try {
        const error = validateSchema(req.body);
        if(error){
            logger.warn("validation error", error.details[0].message);
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            })
        }

        const {username, email, password} = req.body;

        let user = await User.findOne({$or : [{email}, {username}]})

        if(user){
            logger.warn("user already exist");
            return res.status(400).json({
                success: false,
                message: "user already exists"
            })
        }

        user = new user({username, email, password});
        await user.save()
        logger.warn('user created successfully');``
    } catch (error) {
        console.log("----------------error in register user route-----------", error)
    }
}