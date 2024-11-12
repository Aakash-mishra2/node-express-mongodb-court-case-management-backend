require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const multer = require("multer");
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const { GridFSBucket } = require('mongodb');

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
const otpRoutes = require('./routes/otp-routes.js');

app.use('/ccms/public', citizenRoutes);
app.use('/ccms/admin', adminRoutes);
app.use('/ccms/otp', otpRoutes);


//applied on every request with error thrown by express.js
app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.errorCode || 500);
    res.json({ message: error.message || 'An unknown error occured. ' });

});
const db = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kfazawl.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
let gfs, gfsBucket;

mongoose
    .connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

const dbConnection = mongoose.connection;
dbConnection.on('error', console.error.bind(console, "Error connecting to db"));

dbConnection.once('open', () => {
    gfs = new Grid(dbConnection.db, mongoose.mongo);
    gfs.collection('uploads');
    gfsBucket = new GridFSBucket(dbConnection.db, {
        bucketName: 'uploads',
    });
});


const storage = new GridFsStorage({
    url: db,
    file: (req, file) => {
        if (file.mimetype === 'application/pdf') {
            return {
                bucketName: 'uploads',
                filename: `${Date.now()}-${file.originalname}`, // Unique filename
            };
        } else {
            return null;
        }
    },
});

const upload = multer({ storage });

// Upload PDF endpoint
app.post('/ccms/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.status(201).json({ fileId: req.file.id, filename: req.file.filename });
});

// Retrieve PDF by ID endpoint
app.get('/ccms/file/:id', async (req, res) => {
    const fileId = req.params.id;

    // Ensure GridFSBucket instance is initialized
    if (!gfsBucket) {
        console.error('GridFSBucket is not initialized.');
        return res.status(500).json({ error: 'File storage system not initialized' });
    }

    let objectId;
    try {
        objectId = new mongoose.Types.ObjectId(fileId);
    } catch (error) {
        console.error('Invalid file ID format:', error);
        return res.status(400).json({ error: 'Invalid file ID format' });
    }

    try {
        // Find the file in the GridFS collection
        const file = await gfs.files.findOne({ _id: objectId });

        if (!file) {
            console.error('File not found:', fileId);
            return res.status(404).json({ error: 'File not found' });
        }

        // Check if the file is a PDF
        if (file.contentType !== 'application/pdf') {
            console.error('File is not a PDF:', fileId);
            return res.status(400).json({ error: 'Not a PDF file' });
        }

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${file.filename}"`

        });
        const readStream = gfsBucket.openDownloadStream(objectId);

        // Handle errors during streaming
        readStream.on('error', (streamErr) => {
            console.error('Error streaming file:', streamErr);
            res.status(500).json({ error: 'Error streaming file' });
        });

        readStream.pipe(res);
    } catch (error) {
        console.error('Unexpected error fetching file:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


dbConnection.on('connected', () => {
    app.listen(5000, function () {
        console.log('Server started on port 5000. ');
    })
});

dbConnection.on('error', () => {
    console.log('Mongodb connection error');
});
app.use('/ccms', (req, res, next) => {
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
