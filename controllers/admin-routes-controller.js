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

const getAllCases = async (req, res, next) => {
    const { aId } = req.params;
    const filter = req.query;
    let allCases;
    try {
        allCases = await Case.find(filter);
    }
    catch (err) {
        //console.log('FETCH ALL CASES ERROR: ', err, 'Please try again');
    }
    res.status(200).json({ message: "Founds matching cases after filtering", data: allCases });
};

const createNewCase = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        throw new HttpErrors('Invalid request body pased.', 400);
    }
    const { caseType, description, district, documents, registrationFees, state, userAadhar, userId } = req.body;

    let user;
    try {
        user = await Citizen.findById(userId);
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
    try {
        sess = await mongoose.startSession();
        sess.startTransaction();
        await newCase.save({});
        await user.cases.push(newCase);
        await user.save({});
        sess.commitTransaction();
        sess.endSession();
    }
    catch (err) {
        const error = new HttpError("New error found!", 500);
        console.log(err);
    }
    //scope to add encryption and decryption using jwt
    res.status(200).json({ message: "New case added", caseObject: newCase });
}


const updateHearing = async (req, res, next) => {
    const { casetitle, new_status, next_hearing_date, next_hearing_timings, courtName, courtAddress } = req.body;
    const { id } = req.params;
    const updates = req.body;

    const validUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    let yourCase;
    try {
        yourCase = await Case.findById(id);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not find case. ', 500);
        return next(error);
    }
    yourCase.caseTitle = casetitle;
    yourCase.status = new_status;
    yourCase.nextHearing = {
        date: next_hearing_date,
        timings: next_hearing_timings,
    };
    yourCase.court = {
        courtName,
        courtAddress,
    };
    try {
        await yourCase.save();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update Case. ', 500);
        return next(error);
    }
    res.status(200).json({ message: " Your case " + id + " is updated. ", yourCase });
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

    try {
        await yourCase.save();
    } catch (err) {
        console.log(err);
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

// const generateOtp = async (req, res, next) => {
//     const base_url = 'https://www.fast2sms.com/dev/bulkV2';
//     const { phoneNumber, userId } = req.body;
//     const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
//     try {
//         const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
//             sender_id: 'TXTIND',
//             message: `Your OTP is ${otp}`,
//             route: 'v3',
//             numbers: phoneNumber,
//         }, {
//             headers: {
//                 authorization: 'ZKk6e1u8y90t3LFAM7XvEbzQ2IpfRGHJsWc4rBDP5qVnxldTOiJtgp4hLquMrGS09aivCXfAYk8cDQ3V'
//             }
//         });
//     } catch (error) {
//         console.error('Error sending OTP:', error);
//     }
// };

// const verifyOtp = async (req, res, next) => {
//     const { email, otp } = req.body;
//     const storedOtpData = otps[userId];

//     if (!storedOtpData) return res.status(400).json({ message: 'Invalid or expired OTP' });

//     const { otp: storedOtp, expiresAt } = storedOtpData;
//     if (storedOtp != otp || Date.now() > expiresAt) {
//         return res.status(400).json({ message: 'Invalid or expired OTP' });
//     }

//     //OTP is valid, delete it from storage
//     delete otps[userId];
//     res.status(200).json({ message: 'OTP verified successfully' });
// }
module.exports = {
    getAllCases,
    createNewCase,
    updateHearing,
    updatesAndVerification,
    withdrawCase,
    // generateOtp,
    // verifyOtp,
};

