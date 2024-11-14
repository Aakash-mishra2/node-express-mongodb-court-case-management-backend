const HttpError = require('../models/http_error');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const express = require('express');
const otpGenerator = require('otp-generator');
const twilio = require('twilio');
const axios = require('axios');

const app = express();
const otps = {};

app.use(express.json());

const { validationResult } = require('express-validator');
const Citizen = require('../models/citizen');
const Case = require('../models/cases');

const getCasebyID = async (req, res, next) => {
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

const getCasesByUserID = async (req, res, next) => {
    const userID = req.params.uID;
    let thisUserCases, closedCases;
    try {
        thisUserCases = await Citizen.findById(userID).populate('cases');
    }
    catch (err) {
        const error = new HttpError('Something went wrong, could not find a case.', 500);
        return next(error);
    }
    const totalCasesLength = thisUserCases.cases.length;
    try {
        closedCases = await Citizen.findById(userID).populate({
            path: 'cases',
            match: { status: 'closed' }
        });
    }

    catch (err) {
        const error = new HttpError('Closed cases not found!', 500);
        return next(error);
    }
    const closedCasesLength = closedCases.cases.length;
    const activeCasesLength = totalCasesLength - closedCasesLength;
    if (!thisUserCases || thisUserCases.length === 0) {
        const error = new HttpError('Could not find existing cases for the provided user ID.', 404);
        return next(error);
    }
    res.json({
        activeCases: activeCasesLength,
        closedCases: closedCasesLength,
        totalCases: totalCasesLength,
        allCases: thisUserCases.cases.map(item => item.toObject({ getters: true }))
    });
};

const createNewCase = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        throw new HttpErrors('Invalid request body pased.', 400);
    }
    console.log(req.body);

    let user;
    try {
        user = await Citizen.findById(req.body.userId);
    } catch (err) {
        const error = new HttpError("Could not find user, please try again.", 500);
        return next(error);
    }

    const newCase = new Case({
        caseTitle: req.body.caseTitle,
        summary: req.body.summary,
        judge: req.body.judge,
        lawyer: req.body.lawyer,
        court: req.body.court,
        nextHearing: req.body.nextHearing,
        status: req.body.status,
        documents: req.body.documents,
    });
    let sess = null;
    try {
        await newCase.save({});
        await user.cases.push(newCase);
        await user.save({});
    }
    catch (err) {
        const error = new HttpError("New error found!", 500);
        console.log(error);
    }
    //scope to add encryption and decryption using jwt
    res.status(200).json({ message: "New case added", caseObject: newCase });
}

const createCase = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        throw new HttpError('Invalid input passed, please check your data.', 420);
    }

    const { userId, caseType, registrationFees, description } = req.body;
    const newCase = new Case({
        caseType,
        summary: description,
        next_hearing: "",
        status: "Filed",
        plaintiff: userId,
        registrationFees,
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
        await newCase.save({});
        await user.cases.push(newCase);
        await user.save({});
        sess.commitTransaction();
        sess.endSession();
    } catch (err) {
        console.log(err);
        //either database server is down or database validation fails.
        const error = new HttpError("Creating case failed session , please try again.", 500);
        return next(error);
    }
    res.status(200).json({ added_NewCase: newCase });
};


const updateHearing = async (req, res, next) => {
    const { caseId, new_status, next_hearing_date, next_hearing_timings, courtName, courtAddress, courtId } = req.body;
    const caseID = caseId;

    let yourCase;
    try {
        yourCase = await Case.findById(caseId);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not find case. ', 500);
        return next(error);
    }
    yourCase.status = new_status;
    yourCase.nextHearing = {
        date: next_hearing_date,
        timings: next_hearing_timings,
    };
    yourCase.court = {
        courtName,
        courtAddress,
        courtId
    };
    try {
        await yourCase.save();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update Case. ', 500);
        return next(error);
    }
    res.status(200).json({ message: " Your case " + caseID + " is updated. " });
};

const updateLawyer = async (req, res, next) => {
    const { caseId, new_status, judgeName, judgeId, lawyerName, lawyerId } = req.body;
    const caseID = caseId;
    let yourCase;
    try {
        yourCase = await Case.findById(caseID);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not find case. ', 500);
        return next(error);
    }
    yourCase.status = new_status,
        yourCase.judge = {
            judgeName,
            judgeId,
        };
    yourCase.lawyer = {
        lawyerName,
        lawyerId,
    };
    try {
        await yourCase.save();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update Case. ', 500);
        return next(error);
    }
    res.status(200).json({ message: " Your case " + caseID + " is updated. " });

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

const generateOtp = async (req, res, next) => {
    const base_url = 'https://www.fast2sms.com/dev/bulkV2';
    const { phoneNumber, userId } = req.body;
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
    try {
        const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
            sender_id: 'TXTIND',
            message: `Your OTP is ${otp}`,
            route: 'v3',
            numbers: phoneNumber,
        }, {
            headers: {
                authorization: 'ZKk6e1u8y90t3LFAM7XvEbzQ2IpfRGHJsWc4rBDP5qVnxldTOiJtgp4hLquMrGS09aivCXfAYk8cDQ3V'
            }
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
    }
};

const verifyOtp = async (req, res, next) => {
    const { userId, otp } = req.body;
    const storedOtpData = otps[userId];

    if (!storedOtpData) return res.status(400).json({ message: 'Invalid or expired OTP' });

    const { otp: storedOtp, expiresAt } = storedOtpData;
    if (storedOtp != otp || Date.now() > expiresAt) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    //OTP is valid, delete it from storage
    delete otps[userId];
    res.status(200).json({ message: 'OTP verified successfully' });
}

exports.getCasebyID = getCasebyID;
exports.getCasesByUserID = getCasesByUserID;
exports.createCase = createCase;
exports.createNewCase = createNewCase;
exports.updateHearing = updateHearing;
exports.updateLawyer = updateLawyer;
exports.withdrawCase = withdrawCase;
exports.generateOtp = generateOtp;
exports.verifyOtp = verifyOtp;
