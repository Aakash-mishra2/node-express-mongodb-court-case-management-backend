const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false }
});
const HttpError = require('../models/http_error');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const getUserByID = async (req, res, next) => {
    const us_id = req.params.Uid;
    try {
        const result = await pool.query('SELECT * FROM citizens WHERE id = $1', [us_id]);
        if (result.rows.length === 0) {
            return next(new HttpError('User not found', 404));
        }
        res.status(200).json({ foundUser: result.rows[0] });
    } catch (err) {
        next(new HttpError('Error fetching user', 500));
    }
};

const createUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs', 422));
    }
    const { email, password, name, idCardNo, role = 'user' } = req.body;
    try {
        const existing = await pool.query('SELECT * FROM citizens WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return next(new HttpError('User already exists', 422));
        }
        const result = await pool.query(
            'INSERT INTO citizens (name, email, password, image, id_card_no, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, email, password, 'https://static.vecteezy.com/system/resources/previews/022/159/714/original/icon-concept-of-avatar-user-account-for-social-media-with-circle-line-can-be-used-for-technology-business-and-platforms-can-be-applied-to-web-website-poster-mobile-apps-ads-free-vector.jpg', idCardNo, role]
        );
        res.status(200).json({ added: { name: result.rows[0].name, id: result.rows[0].id, email: result.rows[0].email } });
    } catch (err) {
        next(new HttpError('Error creating user', 500));
    }
};

const loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM citizens WHERE email = $1', [email]);
        if (result.rows.length === 0 || result.rows[0].password !== password) {
            return next(new HttpError('Invalid credentials', 401));
        }
        res.json({
            message: 'Logged In!. ',
            citizen: result.rows[0]
        });
    } catch (err) {
        next(new HttpError('Error logging in', 500));
    }
};

const getCasesByUserId = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM cases WHERE plaintiff_id = $1', [id]);
        res.status(200).json({ cases: result.rows });
    } catch (err) {
        next(new HttpError('Error fetching cases', 500));
    }
};

const resetPassword = async (req, res, next) => {
    // Implement password reset logic using SQL
    res.status(200).json({ message: 'Scope for password reset.' });
};

module.exports = {
    getUserByID,
    createUser,
    loginUser,
    getCasesByUserId,
    resetPassword
};
