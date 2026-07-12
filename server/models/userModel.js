import mongoose from 'mongoose';

const SavedBuildSchema = new mongoose.Schema({
    buildRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Build' },
    buildName: { type: String, required: true },
    savedAt: { type: Date, default: Date.now }
}, { _id: false });

const UserSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, 
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: false },
    birthday: { type: String, required: false },
    password: { type: String, required: true },
    avatar: { type: String, required: false },
    isAdmin: { type: Boolean, default: false },
    savedBuilds: [SavedBuildSchema]
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);