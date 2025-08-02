const Notification = require("../models/notifications");
const HttpError = require('../models/http_error');

const getAll = async (req, res, next) => {
    const { userId } = req.params;

    try {
        const notifications = await Notification.findAllByUserId(userId);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching notifications.' });
    }
}

const createNotif = async (req, res, next) => {
    try {
        const notification = new Notification({
            userId,
            message,
        });

        await Notification.create(notificationData);
        res.status(201).json({ message: 'Notification created.', notification });
    } catch (error) {
        res.status(500).json({ error: 'Error creating notification.' });
    }
};

module.exports = {
    getAll,
    createNotif,

};
