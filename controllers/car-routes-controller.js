const HttpError = require('../models/http_error');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const express = require('express');

const app = express();
app.use(express.json());

const { validationResult } = require('express-validator');

const User = require('../models/user');
const Car = require('../models/car');

const getCarbyID = async (req, res, next) => {
    const caseID = req.params.cID;
    let item;
    try {
        item = await Case.findById(caseID);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not find a case.', 500);
        return next(error);
    };
    if (!item) {
        const error = new HttpError('Could not find any case by this ID', 500);
        return next(error);
    }
    res.status(200).json({ foundCase: item.toObject({ getters: true }) });
};

const getCarsByUserID = async (req, res, next) => {
    const userID = req.params.uID;
    try {
        thisUserCases = await User.findById(userID).populate('cars');
    }
    catch (err) {
        const error = new HttpError('Something went wrong, could not find a case.', 500);
        return next(error);
    }

    if (!thisUserCases || thisUserCases.length === 0) {
        const error = new HttpError('Could not find existing cases for the provided user ID.', 404);
        return next(error);
    }
    res.json({
        data: thisUserCases.cases.map(item => item.toObject({ getters: true }))
    });
};


const createCar = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        throw new HttpError('Invalid input passed, please check your data.', 420);
    }
    console.log('user', req.body);
    const { title, description, tags } = req.body;
    // req.body.images.forEach((image) => extractedImages.push(JSON.parse(image)));


    const newCar = new Car({
        title,
        description,
        tags: tags ? tags.split(',') : [],
        images: imagePaths
    });
    let user;
    try {
        user = await Citizen.findById(userId);
    } catch (err) {
        const error = new HttpError("Creating Case failed, please try again.", 500);
        return next(error);
    }

    if (!user) {
        const error = new HttpError("Could not find user for provided ID. ", 404);
        return next(error);
    }
    let sess = null;
    try {
        sess = await mongoose.startSession();
        sess.startTransaction();
        await newCar.save({});
        await user.Car.push(newCar);
        await user.save({});
        sess.commitTransaction();
        sess.endSession();
    } catch (err) {
        console.log(err);
        //either database server is down or database validation fails.
        const error = new HttpError("Creating case failed session , please try again.", 500);
        return next(error);
    }
    res.status(200).json({ added_NewCar: newCar });
};


const updateCar = async (req, res, next) => {
    const carID = req.params.cid;
    const { cardNo, description } = req.body;
    let selectedCar;
    try {
        selectedCar = await Car.findById(carID);
    } catch (err) {
        const error = new HttpError('Something went wrong! Could not find case!', 500);
        return next(error);
    }
    selectedCar.description = description;
    try {
        await selectedCar.save();
    }
    catch (err) {
        const error = " Could not update case. Try again later!";
        return next(error);
    }
    res.status(200).json({ message: "Your car " + carID + " is updated. " });
};

const deleteCar = async (req, res, next) => {
    const delID = req.params.cID;
    let deleteCar;
    try {
        deleteCar = await Car.findById(delID);
    } catch (err) {
        const error = new HttpError(' Car not found. Please retry. ');
        return next(error);
    }
    if (!deleteCar) {
        const error = new HttpError('Could not find a case by this ID', 404);
        return next(error);
    }
    // console.log(deleteCase);
    try {
        const sess2 = await mongoose.startSession();
        sess2.startTransaction();
        deleteCar.user.cars.pull(deleteCar);
        await deleteCar.user.save({ session: sess2 });
        await Car.deleteOne({ id: delID });
        await sess2.commitTransaction();
        sess2.endSession();
    } catch (err) {
        const error = new HttpError(' Something went wrong, could not delete Car. ', 500);
        return next(error);
    }
    res.status(201).json({ message: "Deleted Case" })
}

exports.getCarbyID = getCarbyID;
exports.getCarsByUserID = getCarsByUserID;
exports.createCar = createCar;
exports.updateCar = updateCar;
exports.deleteCar = deleteCar;