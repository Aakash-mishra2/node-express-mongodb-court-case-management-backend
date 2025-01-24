const HttpError = require('../models/http_error');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const express = require('express');
// const otpGenerator = require('otp-generator');
// const twilio = require('twilio');

// const otps = {};

const app = express();
app.use(express.json());

const { validationResult } = require('express-validator');
const Citizen = require('../models/citizen');
const Case = require('../models/cases');
const Notification = require('../models/notifications');

const getAllCases = async (req, res, next) => {
    const { aId } = req.params;
    const filter = req.query;
    let allCases;
    try {
        allCases = await Case.find(filter);
    }
    catch (err) {
        console.log('FETCH ALL CASES ERROR: ', err, 'Please try again');
        return next(new HttpError("Could not fetch cases, try again."))
    }
    res.status(200).json({ message: "Founds matching cases after filtering", data: allCases });
};

const createNewCase = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        const error = HttpErrors('Invalid request body passed.', 400);
        return next(error);
    }
    const { caseType, description, district, documents, registrationFees, state, userAadhar, userId } = req.body;

    let existing;
    try {
        existing = await Citizen.findById(userId);

    } catch (err) {
        const error = new HttpError("Could not find user, please try again.", 500);
        return next(error);
    }

    const newCase = new Case({
        caseTitle: "New Application",
        registration: registrationFees,
        aadharNo: userAadhar,
        summary: description,
        userAddress: { state, district },
        caseType: caseType,
        status: "filed",
        documents: documents,
        plaintiff: userId,
    });

    let sess = null;
    const notification = new Notification({
        userId,
        message: 'Your application is recieved. Kindly wait until verfications.'
    })


    try {
        sess = await mongoose.startSession();
        sess.startTransaction();
        await newCase.save({ session: sess });
        console.log('new case', newCase);

        await existing.cases.push(newCase);
        console.log('cases', existing.cases);

        existing.save({ session: sess });
        console.log('user', existing);

        await notification.save({ session: sess });
        console.log('notif', notification);

        await sess.commitTransaction();
    }
    catch (err) {
        if (sess) {
            await sess.abortTransaction();
        }
        const error = new HttpError("New error found!", 500);
        return next(error);
    }
    finally {
        if (sess) sess.endSession();
    }
    //scope to add encryption and decryption using jwt
    res.status(200).json({ message: "New case added", caseObject: newCase });
}


const updateHearing = async (req, res, next) => {
    const { id } = req.params;
    const updates = req.body;
    // Use $set to update only the fields
    try {
        const updatedCase = await Case.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );


        if (!updatedCase) {
            return res.status(404).json({ message: "Case not found." });
        }
        const notification = new Notification({
            userId: updatedCase.plaintiff,
            message: 'Case schedule is updated.'
        });

        notification.save();
        res.status(200).json({ message: 'Case Updated', caseObject: updatedCase });
    }
    catch (error) {
        return next(new HttpError(error.message));
    }
};

const updatesAndVerification = async (req, res, next) => {
    const { action, new_status = "", lawyerDocuments, lawyerName = "", enrollmentNumber = "" } = req.body;

    const { id } = req.params;
    let yourCase;
    try {
        yourCase = await Case.findById(id);
    } catch (err) {
        const error = new HttpError('Failed to update! Case not found.', 500);
        return next(error);
    }
    if (action === "verify-documents") {
        yourCase.status = new_status;
    }
    else if (action === 'update-lawyer')
        yourCase.status = "pending";
    yourCase.lawyer = {
        lawyerName,
        enrollmentNumber,
        relatedDocs: lawyerDocuments,
    };
    const notification = new Notification({
        userId: yourCase.plaintiff,
        message: 'Your Case Lawyer is updated.'
    });

    try {
        await notification.save();
        await yourCase.save();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update Case. ', 500);
        return next(error);
    }
    res.status(200).json({ message: " Your case " + id + " is updated. ", data: yourCase });
}

const withdrawCase = async (req, res, next) => {
    const deleteID = req.params.cID;
    let deleteCase;
    try {
        deleteCase = await Case.findById(deleteID).populate('plaintiff');
    } catch (err) {
        const error = new HttpError(' Could not find your place. Please retry. ');
        return next(error);
    }
    if (!deleteCase) {
        const error = new HttpError('could not find a case by this ID', 404);
        return next(error);
    }
    try {
        const sess2 = await mongoose.startSession();
        sess2.startTransaction();
        deleteCase.plaintiff.cases.pull(deleteCase);
        await deleteCase.plaintiff.save({ session: sess2 });
        await Case.deleteOne({ id: deleteID });
        await sess2.commitTransaction();
        sess2.endSession();
    } catch (err) {
        const error = new HttpError(' Something went wrong, could not delete place. ', 500);
        return next(error);
    }
    res.status(201).json({ message: "Deleted Case" })
}

module.exports = {
    getAllCases,
    createNewCase,
    updateHearing,
    updatesAndVerification,
    withdrawCase,
    // generateOtp,
    // verifyOtp,
};
