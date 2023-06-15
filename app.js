const bodyParser = require('body-parser');
const express = require('express');
const app = express();

app.use(bodyParser.json());

const citizenRoutes = require('./routes/citizen-routes');
const adminRoutes = require('./routes/admin-routes');
app.use('/ccms/public', citizenRoutes);
app.use('/ccms/cases', adminRoutes);

const HttpError = require('./models/http_error');
app.use((req, res, next) => {
    const error = new HttpError("We do not support this route yet.", 404);
    throw error;
});

app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.errorCode || 500);
    res.json({ message: error.message || 'An unknown error occured. ' });

})
app.listen(5000);