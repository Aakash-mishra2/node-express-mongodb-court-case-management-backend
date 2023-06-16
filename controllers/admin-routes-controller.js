const HttpError = require('../models/http_error');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

const { validationResult } = require('express-validator');
const Citizen = require('../models/citizen');
const Case = require('../models/cases');

let DUMMY_CASES = [
    {
        id: 'th234',
        court: 'Supreme Court of India',
        description: " Land Dispute case ",
        image: " ",
        location: {
            city: "Delhi",
            pincode: 11232424
        },
        judge: "Mr. Suresh Jain",
        next_hearing: "03 - 06 - 2023",
        status: "PENDING"
    },
    {
        id: 'lhd4334',
        court: 'Allahabad High Court ',
        description: " Defamation case by MLA on opposition leader ",
        location: {
            city: "Allahabad, Uttar Pradesh",
            pincode: 9080980
        },
        judge: "Mr. Zakir khan",
        next_hearing: "07 - 06 - 2023",
        status: "APPLIED"
    }];

const getCasebyID = async (req, res, next) => {
    const caseID = req.params.cID;
    let item;
    try {
        item = await Case.findById(caseID);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not find a case.', 500)
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
    let thisUserCases;
    try {
        thisUserCases = await Citizen.findById(userID).populate('cases');
    } catch (err) {
        const error = new HttpError('Something went wrong, could not find a place.', 500);
        return next(error);
    }
    if (!thisUserCases || thisUserCases.length === 0) {
        const error = new HttpError('Could not find existing cases for the provided user ID.', 404)
        return next(error);
    }
    res.json({ allCases: thisUserCases.cases.map(item => item.toObject({ getters: true })) });
};

const createCase = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        throw new HttpError('Invalid input passed, please check your data.', 420);
    }

    const { court, description, location_city, location_pincode, judge, plaintiff } = req.body;

    const newCase = new Case({
        court,
        description,
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRholMhydH0A3KqdWelqNqBG_YgCPQaOXa2vS2SufTU5w&usqp=CAU&ec=48600113',
        location: {
            city: location_city,
            pincode: location_pincode
        },
        judge,
        next_hearing: " TO BE DECIDED ",
        status: "NOT ACCEPTED",
        plaintiff
    });
    console.log(newCase);
    console.log(location_city);
    console.log(location_pincode);
    let user;
    try {
        user = await Citizen.findById(plaintiff);
    } catch (err) {
        const error = new HttpError("Creating Case failed, please try again.", 500);
        return next(error);
    }
    console.log(user);

    if (!user) {
        const error = new HttpError("Could not find user for provided ID. ", 404);
        return next(error);
    }
    let sess;
    try {
        sess = await mongoose.startSession();
        sess.startTransaction();
        console.log('1');
        await newCase.save({ session: sess });
        console.log('2');
        await user.cases.push(newCase);
        console.log('3');
        await user.save({ session: sess });
        console.log('4');
        await sess.commitTransaction();
        console.log('5');
        sess.endSession();
    } catch (err) {
        //either database server is down or database validation fails.
        const error = new HttpError("Creating place failed session , please try again.", 500);
        return next(error);
    }
    res.status(200).json({ added_NewCase: newCase });
};

const updateHearing = async (req, res, next) => {
    const caseID = req.params.cid;
    const { new_status, next_hearing } = req.body;

    let yourCase;
    try {
        yourCase = await Case.findById(caseID);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not find place. ', 500);
        return next(error);
    }

    yourCase.status = new_status;
    yourCase.next_hearing = next_hearing;
    try {
        await yourCase.save();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update Case. ', 500);
        return next(error);
    }
    res.status(200).json({ message: " Your case " + caseID + " is updated. " });
};

const withdrawCase = async (req, res, next) => {
    const deleteID = req.params.dID;
    let deleteCase;
    try {
        deleteCase = await Case.findById(deleteID).populate('plaintiff');
    } catch (err) {
        const error = new HttpError(' Could not find your place. Please retry. ');
        return next(error);
    }
    if (!deleteCase) {
        const error = new HttpError('could not find place for this ID', 404);
        return next(error);
    }

    try {
        const sess2 = await mongoose.startSession();
        sess2.startTransaction();

        await deleteCase.remove({ session: sess2 });
        deleteCase.plaintiff.cases.pull(deleteCase);
        await deleteCase.plaintiff.save({ session: sess2 });

        await sess2.commitTransaction();
        sess2.endSession();
    } catch (err) {
        const error = new HttpError(' Something went wrong, could not delete place. ', 500);
        return next(error);
    }
    res.status(201).json({ message: "Deleted Case" })
}

exports.getCasebyID = getCasebyID;
exports.getCasesByUserID = getCasesByUserID;
exports.createCase = createCase;
exports.updateHearing = updateHearing;
exports.withdrawCase = withdrawCase;

