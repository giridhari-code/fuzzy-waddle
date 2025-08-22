const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['success', 'warning', 'info', 'error'],
        default: 'info',
    },
    read: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
