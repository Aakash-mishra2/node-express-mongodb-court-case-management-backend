const HttpError = require('../models/Errors');
const { validationResult } = require('express-validator');

let DUMMY_CASES = [
    {
        id: 'th234',
        court: 'Supreme Court of India',
        description: " Land Dispute case ",
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

const getCasebyID = (req, res, next) => {
    const caseID = req.params.cid;
    const userCase = DUMMY_CASES.find(c => c.id === caseID);
    if (!userCase) {
        throw new HttpError('Could not find any case by this ID', 500);
    }
    res.status(200).json({ foundCase: userCase });
};

const createCase = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        throw new HttpError('Invalid input passed, please check your data.', 420);
    }

    const { id, court, description, location, judge } = req.body;

    const newCase = {
        id,
        court,
        description,
        location,
        judge,
        next_hearing: " TO BE DECIDED ",
        status: "NOT ACCEPTED"
    };
    DUMMY_CASES.push(newCase);
    console.log(DUMMY_CASES);

    res.status(200).json({ added_NewCase: newCase });
};

const updateHearing = (req, res, next) => {
    const caseID = req.params.cid;
    const { new_status, next_hearing } = req.body;

    const yourCaseIndex = DUMMY_CASES.findIndex(e1 => e1.id === caseID);
    const yourCase = DUMMY_CASES.find(c => c.id === caseID);

    if (!yourCase) {
        throw new HttpError(' Please enter correct case id. ', 404);
    }

    yourCase.status = new_status;
    yourCase.next_hearing = next_hearing;

    DUMMY_CASES[yourCaseIndex] = yourCase;
    res.status(200).json({ message: " Your case " + caseID + " is updated. " });

    console.log(DUMMY_CASES[yourCaseIndex]);
};

const withdrawCase = (req, res, next) => {
    const delID = req.params.did;
    DUMMY_CASES = DUMMY_CASES.filter(del => del.id != delID);
    res.status(200).json({ message: "Deleted the Case." });
    console.log(DUMMY_CASES);
}

exports.fetchCase = getCasebyID;
exports.newcase = createCase;
exports.hearing = updateHearing;
exports.withdraw = withdrawCase;

