const HttpError = require('../models/http_error');
const { validationResult } = require('express-validator');
const Citizen = require('../models/citizen');

const getUser = async (req, res, next) => {
    let allUsers;
    try {
        allUsers = await Citizen.find({}, "-password -idCardNo");
    } catch (err) {
        const error = new HttpError('Could not get all Users. ', 400);
        return next(error);
    }
    if (!allUsers) {
        return next(new HttpError('Could not find any Users. ', 400));
    }
    res.status(200).json({ plaintiffs: allUsers.map(user => user.toObject({ getters: true })) });
}

const getUserByID = async (req, res, next) => {
    const us_id = req.params.Uid;
    let identifiedUser;
    try {
        identifiedUser = await Citizen.findById(us_id, "-idCardNo -password");
    }
    catch (err) {
        const error = new HttpError('Could not get this Citizen', 400);
        return next(error);
    }
    if (!identifiedUser) {
        const error = new HttpError('No user found for this provided ID. ');
        return next(error);
    }
    res.status(200).json({ foundUser: identifiedUser.toObject({ getters: true }) });

}
const createUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new HttpError("Invalid request sent. Please send correct input. ");
        return next(error);
    }

    const { email, password, name, idCardNo } = req.body;
    let existingUser;
    try {
        existingUser = await Citizen.findOne({ idCardNo: idCardNo }, { password: 0, idCardNo: 0 });
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
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRholMhydH0A3KqdWelqNqBG_YgCPQaOXa2vS2SufTU5w&usqp=CAU&ec=48600113',
        idCardNo,
        cases: []
    });

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError('Signing up failed, please try again.', 500);
        return next(error);
    }
    res.status(200).json({ added: createdUser.name });
}

const loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    let existingUser;
    try {
        existingUser = await Citizen.findOne({ email: email }, { password: 0 });
    } catch (err) {
        const error = new HttpError('Login to this User failed, please try again later', 500);
        return next(error);
    }
    if (!existingUser || existingUser.password != password) {
        const error = new HttpError(' Invalid Credentials, could not log you in.', 401);
        return next(error);
    }
    res.json({
        message: 'Logged In!. ',
        citizen: existingUser.toObject({ getters: true })
    });
}

exports.getUser = getUser;
exports.getUserByID = getUserByID;
exports.createUser = createUser;
exports.loginUser = loginUser;