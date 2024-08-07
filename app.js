require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const PORT = process.env.PORT || 5000;
const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-with, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
});

const citizenRoutes = require('./routes/citizen-routes');
const adminRoutes = require('./routes/admin-routes');
app.use('/ccms/public', citizenRoutes);
app.use('/ccms/admin', adminRoutes);


app.use('/ccms',(req, res, next) => {
    res.json({
        welcome: 'Welcome to court case management system. Please follow README file for API Documentation and access all routes',
        ReadMe: 'https://github.com/Aakash-mishra2/node-express-mongodb-court-case-management-backend#readme'
    });
})

const HttpError = require('./models/http_error');
app.use((req, res, next) => {
    const error = new HttpError("We do not support this route yet.", 404);
    throw error;
});
//applied on every request with error thrown by express.js
app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.errorCode || 500);
    res.json({ message: error.message || 'An unknown error occured. ' });

});
const db = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kfazawl.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
mongoose
    .connect(db)
    .then(() => {
        app.listen(PORT, function () { console.log('Server started on port 5000.') });
    })
    .catch(err => {
        console.log(err);
    });