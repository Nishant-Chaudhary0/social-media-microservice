import mongoose from "mongoose";

const RefreshToken = mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    }, expiresAt : {
        type: Date,
        required: true
    }
},{timestamps: true})