const HttpError = require('../models/Errors');
const { validationResult } = require('express-validator');

const DUMMY_USERS = [{
    id: "u1",
    name: "Mr. Joshi",
    age: 34,
    caseCount: 3,
    case_id: "th234"
},
{
    id: "u2",
    name: "Mr. Anand raj",
    age: 57,
    caseCount: 4,
    case_id: "lhd4334"
}
]

const getUserByCaseID = (req, res, next) => {
    const case_id = req.params.cid;
    const identifiedUser = DUMMY_USERS.find(u => u.id === case_id);

    if (!identifiedUser) {
        throw (new HttpError('No user found for this case ID. '));
    }

    res.status(200).json({ foundUser: identifiedUser });
}
const createUser = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError("Invalid request sent. Please send correct input. ");
    }

    const { id, name, age, caseCount, case_id } = req.body;
    const newUser = {
        id,
        name,
        age,
        caseCount,
        case_id
    }
    if (!newUser) {
        throw new HttpError("Invalid inputs sent by frontEnd request body. ");
    }
    DUMMY_USERS.push(newUser);
    console.log(DUMMY_USERS);
    res.status(200).json({ added: newUser });
}
exports.fetchUser = getUserByCaseID;
exports.createUser = createUser;