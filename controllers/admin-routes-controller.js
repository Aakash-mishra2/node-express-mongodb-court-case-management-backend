const HttpError = require('../models/Errors');
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
    const caseID = req.params.cid;
    let item;
    try {
        item = await Case.findById(cid);
    } catch (err) { const error = new HttpError('Something went wrong, could not find a case.', 500) };
    if (!item) {
        const error = new HttpError('Could not find any case by this ID', 500);
        return next(error);
    }
    res.status(200).json({ foundCase: item.toObject({ getters: true }) });
};

const getCasesByUserID = async (req, res, next) => {
    const userID = req.params.userId;
    let thisUserCases;
    try {
        thisUserCases = await User.findById(userID).populate('cases');
    } catch (err) {
        const error = new HttpError('Something went wrong, could not find a place.', 500);
        return next(error);
    }
    if (!thisUserCases || thisUserCases.length === 0) {
        const error = new HttpError('Could not existing cases for the provided user ID.', 404)
        return next(error);
    }
    res.json({ userPlaces: thisUserCases.places.map(item => item.toObject({ getters: true })) });
};

const createCase = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        throw new HttpError('Invalid input passed, please check your data.', 420);
    }

    const { id, court, description, location, judge, plaintiff } = req.body;

    const newCase = new Case({
        id,
        court,
        description,
        location,
        judge,
        next_hearing: " TO BE DECIDED ",
        status: "NOT ACCEPTED",
        plaintiff
    });
    console.log(newCase);
    let user;
    try {
        user = await Citizen.findById(plaintiff);
    } catch (err) {
        const error = new HttpError('Creating Case failed, please try again.', 500);
        return next(error);
    }
    if (!user) {
        const error = new HttpError("Could not find user for provided ID. ", 404);
        return next(error);
    }
    console.log(user);
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await newCase.save({ session: sess });

        user.cases.push(createdPlace);
        await user.save({ session: sess });

        await sess.commitTransaction();
        sess.endSession();
    } catch (err) {
        //either database server is down or database validation fails.
        const error = new HttpError(
            'Creating place failed session , please try again.',
            500
        );
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

exports.fetchCase = getCasebyID;
exports.caseByUser = getCasesByUserID;
exports.newcase = createCase;
exports.hearing = updateHearing;
exports.withdraw = withdrawCase;

