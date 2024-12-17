const HttpError = require('../models/http_error');
const { validationResult } = require('express-validator');
const Citizen = require('../models/citizen');
const Case = require('../models/cases');
const Notification = require('../models/notifications');

const jwt = require('jsonwebtoken');
require('dotenv').config();

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

    const { email, password, name, idCardNo, role = 'user' } = req.body;
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
        const error = new HttpError(`Failed, ${role} exists already, Try login.`, 401);
        return next(error);
    }

    const newUser = new Citizen({
        name,
        email,
        password,
        image: 'https://static.vecteezy.com/system/resources/previews/022/159/714/original/icon-concept-of-avatar-user-account-for-social-media-with-circle-line-can-be-used-for-technology-business-and-platforms-can-be-applied-to-web-website-poster-mobile-apps-ads-free-vector.jpg',
        idCardNo,
        role,
        ...(role === 'user' && { cases: [] })
    });

    let createdUser = null;
    try {
        createdUser = await newUser.save();
    } catch (err) {
        const error = new HttpError('Signing up failed, please try again.', 500);
        return next(error);
    }
    const userObject = {
        name: createdUser.name,
        id: createdUser._id.toString(),
        email: createdUser.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

    res.status(200).json({ token, added: userObject });
}

const loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    let existingUser;
    try {
        existingUser = await Citizen.findOne({ email: email });
    } catch (err) {
        const error = new HttpError('Login failed, please try again later', 500);
        return next(error);
    }
    if (!existingUser || existingUser.password != password) {
        const error = new HttpError(' Invalid Credentials, could not log you in.', 401);
        return next(error);
    }

    const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
    existingUser.password = 0;
    existingUser.idCardNo = 0;
    res.json({
        message: 'Logged In!. ',
        token: token,
        citizen: existingUser.toObject({ getters: true })
    });
}


const getCasesByUserId = async (req, res, next) => {
    const { id } = req.params;
    const { filter } = req.body;
    let thisUserCases, closedCases;
    const populateOptions = { path: 'cases' };
    if (filter && filter.status) populateOptions.match = { status: filter.status };
    try {
        thisUserCases = await Citizen.findById(id).populate(populateOptions);
    }
    catch (err) {
        const error = new HttpError('Something went wrong, could not find a case.', 500);
        return next(error);
    }
    const totalCasesLength = thisUserCases.cases.length;
    try {
        closedCases = await Citizen.findById(id).populate({
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
}

const resetPassword = async (req, res, next) => {
    const { id } = req.params;
    const { new_password } = req.body;
    const user = await Citizen.findById(id);

    if (!user) {
        return next(new HttpError('User not found', 500));
    }
    user.password = new_password;

    try {
        const notification = new Notification({
            userId: id,
            message: "Password updated Succesfully.",
        });

        await notification.save();
        await user.save();
        res.status(200).json({ message: "Password updated", user });
    }
    catch (error) {
        res.status(500).json({ error: 'Error upating password.' });
    }

}

module.exports = {
    getUserByID,
    createUser,
    loginUser,
    getCasesByUserId,
    resetPassword
}
