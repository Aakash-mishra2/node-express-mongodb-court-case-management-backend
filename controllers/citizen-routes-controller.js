const HttpError = require('../models/http_error');
const { validationResult } = require('express-validator');
const Citizen = require('../models/citizen');
const Case = require('../models/cases');
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

    const newUser = new Citizen({
        name,
        email,
        password,
        image: 'https://static.vecteezy.com/system/resources/previews/022/159/714/original/icon-concept-of-avatar-user-account-for-social-media-with-circle-line-can-be-used-for-technology-business-and-platforms-can-be-applied-to-web-website-poster-mobile-apps-ads-free-vector.jpg',
        idCardNo,
        cases: []
    });
    let createdUser = null;
    try {
        createdUser = await newUser.save();
    } catch (err) {
        const error = new HttpError('Signing up failed, please try again.', 500);
        return next(error);
    }
    res.status(200).json({ added: {name : createdUser.name, id: createdUser._id.toString()} });
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
    if (!existingUser || existingUser.password != password) {
        const error = new HttpError(' Invalid Credentials, could not log you in.', 401);
        return next(error);
    }
    existingUser.password = 0;
    existingUser.idCardNo = 0;
    res.json({
        message: 'Logged In!. ',
        citizen: existingUser.toObject({ getters: true })
    });
}
const updateUserCase = async(req, res, next) => {
    const citID = req.params.cid;
    const { cardNo, description } = req.body;
    let selectedCase;
    try{
        selectedCase = await Case.findById(citID);
    } catch(err){
        const error = new HttpError('Something went wrong! Could not find case!', 500);
        return  next(error);
    }
    selectedCase.description = description;
    try{
        await selectedCase.save();
    }
    catch(err){
        const error = " Could not update case. Try again later!";
        return next(error);
    }
    res.status(200).json({ message: "Your case " + citID + " is updated. "});
};
exports.getUser = getUser;
exports.getUserByID = getUserByID;
exports.createUser = createUser;
exports.loginUser = loginUser;
exports.updateUserCase = updateUserCase;