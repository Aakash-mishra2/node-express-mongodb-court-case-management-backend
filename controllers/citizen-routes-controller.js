const HttpError = require('../models/Errors');
const { validationResult } = require('express-validator');
const Citizen = require('../models/citizen');

const DUMMY_USERS = [{
    id: "u1",
    name: "Mr. Joshi",
    email: 'test@ijk.com',
    image: '',
    caseCount: 3,
    case_id: "th234"
},
{
    id: "u2",
    name: "Mr. Anand raj",
    age: 57,
    image: '',
    case_id: "lhd4334"
}
]
const getUser = async (req, res, next) => {
    let allUsers;
    try {
        allUsers = await Citizen.find();
    } catch (err) {
        const error = new HttpError('Could not get all Users. ', 400);
        return next(error);
    }
    if (!allUsers) {
        return next(new HttpError('Could not find any Users. ', 400));
    }
    res.status.json({ plaintiffs: allUsers.map(user => user.toObject({ getters: true })) });
}

const getUserByID = async (req, res, next) => {
    const us_id = req.params.Uid;
    let identifiedUser;
    try {
        identifiedUser = await Citizen.findById(us_id);
    }
    catch (err) {
        const error = new HttpError('Could not get this Citizen', 400);
        return next(error);
    }
    if (!identifiedUser) {
        throw (new HttpError('No user found for this provided ID. '));
    }
    res.status(200).json({ foundUser: identifiedUser.toObject({ getters: true }) });

}
const createUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError("Invalid request sent. Please send correct input. ");
    }

    const { name, email, password, idCardNo, } = req.body;
    let existingUser;
    try {
        existingUser = await Citizen.findOne({ idCardNo: idCardNo });
    } catch (err) {
        const error = new HttpError(
            'Signing up failed please try again later. ', 500
        );
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError('Signup failed, user exists already, please login instead.', 401);
        return next(error);
    }

    const createdUser = new Citizen({
        name,
        email,
        password,
        image: 'https://---.com',
        idCardNo,
        cases: []
    });

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError(
            'Signing up failed, please try again.',
            500
        );
        return next(error);
    }
    res.status(200).json({ added: createdUser.toObject({ getters: true }) });
}

const loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    let existingUser;
    try {
        existingUser = await Citizen.findOne({ email: email });
    } catch (err) {
        const error = new HttpError('Login to this User failed, please try again later', 500);
        return next(error);
    }
    if (existingUser || existingUser.password != password) {
        const error = new HttpError(' Invalid Credentials, could not log you in.', 401);
        return next(error);
    }
    res.json({ message: 'Logged In!. ' });
}

exports.allUser = getUser;
exports.fetchUser = getUserByCaseID;
exports.createUser = createUser;
exports.logUser = loginUser;