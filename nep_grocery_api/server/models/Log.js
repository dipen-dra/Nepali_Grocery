import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    method: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        required: true
    },
    ip: {
        type: String
    },
    userAgent: {
        type: String
    },
    meta: {
        type: mongoose.Schema.Types.Mixed
    }
}, { timestamps: true });

// Index for easier querying by date and user
LogSchema.index({ createdAt: -1 });
LogSchema.index({ user: 1 });

const Log = mongoose.model('Log', LogSchema);
export default Log;
