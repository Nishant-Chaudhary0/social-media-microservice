import mongoose from "mongoose";

const Post = new mongoose.Schema({
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
},{timestamps: true});

const post = mongoose.model("post", Post);

export default post;