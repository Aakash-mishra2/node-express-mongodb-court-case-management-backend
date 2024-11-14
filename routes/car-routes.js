const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const multer = require('multer');
const path = require('path');
const Car = require('../models/car');

const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'car_images',
        allowed_formats: ['jpg', 'jpeg', 'png'],
    },
})

const upload = multer({ storage });
const admin = require('../controllers/car-routes-controller');

router.get('/:cID', admin.getCarbyID);
router.get('/user/:uID', admin.getCarsByUserID);
router.post('/newcar', upload.array('images', 5), async (req, res) => {
    try {
        const { title, description, tags } = req.body;
        const imagePaths = req.files.map((file) => file.path); // Get file paths

        const car = new Car({
            title,
            description,
            images: imagePaths,
            tags: tags ? tags.split(',') : [], // Parse tags as an array
        });
        await car.save();
        res.status(201).json({ message: 'Images uploaded succesfully', car });

    } catch (error) {
        res.status(500).json({ message: 'Failed to upload images', error });
    }
});
router.patch('/update/:cid', admin.updateCar);
router.delete('/remove/:cID', admin.deleteCar);
module.exports = router;
