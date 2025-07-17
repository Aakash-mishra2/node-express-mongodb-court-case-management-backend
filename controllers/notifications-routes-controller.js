const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false }
});
const Notification = {};
const HttpError = require('../models/http_error');

const getAll = async (req, res, next) => {
    const { userId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching notifications.' });
    }
};

const createNotif = async (req, res, next) => {
    const { userId, message } = req.body;
    try {
        const result = await pool.query('INSERT INTO notifications (user_id, message) VALUES ($1, $2) RETURNING *', [userId, message]);
        res.status(201).json({ message: 'Notification created.', notification: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Error creating notification.' });
    }
};

module.exports = {
    getAll,
    createNotif,
};