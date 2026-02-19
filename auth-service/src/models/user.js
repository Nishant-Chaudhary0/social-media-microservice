import mongoose from 'mongoose';
import argon2 from 'argon2';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 5,
    }
}, { timestamps: true });

/* Hash password before saving */
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        this.password = await argon2.hash(this.password);
        next();
    } catch (error) {
        next(error);
    }
});

/* Compare password */
UserSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await argon2.verify(this.password, candidatePassword);
    } catch (error) {
        throw error;
    }
};

UserSchema.index({ username: 'text' });

const User = mongoose.model('User', UserSchema);

export default User;
