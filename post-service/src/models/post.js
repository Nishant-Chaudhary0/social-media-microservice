import mongoose from "mongoose";

const Post = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    mediaUrl: [
        {
            type: String,
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    mediaIds: {
        type:  mongoose.Schema.Types.ObjectId,
        required: true
    }
}, { timestamps: true });

const post = mongoose.model("post", Post);

export default post;