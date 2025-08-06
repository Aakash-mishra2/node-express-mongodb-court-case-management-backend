const jwt = require('jsonwebtoken');
const HttpError = require('../models/http_error');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new HttpError('No token provided', 401));
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
        req.userData = decoded;
        next();
    } catch (err) {
        return next(new HttpError('Invalid or expired token', 401));
    }
};
