const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    read: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Notification', notificationSchema);
const { query } = require('../config/database');

class Notification {
    constructor(data) {
        this.id = data.id;
        this.userId = data.user_id;
        this.message = data.message;
        this.read = data.read;
        this.createdAt = data.created_at;
    }

    static async create(notificationData) {
        const { userId, message } = notificationData;
        const result = await query(
            'INSERT INTO notifications (user_id, message) VALUES ($1, $2) RETURNING *',
            [userId, message]
        );
        return new Notification(result.rows[0]);
    }

    static async findByUserId(userId) {
        const result = await query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        return result.rows.map(row => new Notification(row));
    }

    static async markAsRead(id) {
        const result = await query(
            'UPDATE notifications SET read = TRUE WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows.length ? new Notification(result.rows[0]) : null;
    }

    static async deleteById(id) {
        await query('DELETE FROM notifications WHERE id = $1', [id]);
        return true;
    }
}

module.exports = Notification;
