const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// @desc    Get all notifications for the authenticated user
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
router.patch('/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json(notification);
    } catch (error) {
        res.status(400).json({ message: 'Error updating notification', error: error.message });
    }
});

module.exports = router;
