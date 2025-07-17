require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const citizenRoutes = require('./routes/citizen-routes');
const adminRoutes = require('./routes/admin-routes');
const otpRoutes = require('./routes/otp-routes.js');
const notificationsRoutes = require('./routes/notifications-routes.js');
const supabase = require('./supabaseClient.js');

console.log('Supabase client initialized and connected.');

const PORT = process.env.PORT || 5000;
const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use('/ccms/user', citizenRoutes);
app.use('/ccms/admin', adminRoutes);
app.use('/ccms/otp', otpRoutes);
app.use('/ccms/notifications', notificationsRoutes);

app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.errorCode || 500);
    res.json({ message: error.message || 'An unknown error occured. ' });
});

app.use('/ccms', (req, res, next) => {
    res.json({
        welcome: 'Welcome to court case management system. Please follow README file for API Documentation and access all routes',
        ReadMe: 'https://github.com/Aakash-mishra2/node-express-mongodb-court-case-management-backend#readme'
    });
});

const HttpError = require('./models/http_error');
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found.' });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

module.exports = app;