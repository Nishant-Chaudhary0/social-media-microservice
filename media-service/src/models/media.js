import mongoose from "mongoose";

const media = mongoose.Schema({
    publicId: {
        type: String,
        required: true
    },
    originalName: {
         type: String,
        required: true
    },
    mimeType: {
         type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        reference: 'User'
    }
},{timestamps:true})

const Media = mongoose.model('Media', media);

export default Media;