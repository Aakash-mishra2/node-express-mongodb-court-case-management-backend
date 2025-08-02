const Citizen = require('../models/citizen');
const Case = require('../models/case');
const Notification = require('../models/notifications');
const HttpError = require('../models/http_error');

const getUserByID = async (req, res, next) => {
    const { id } = req.params;

    try {
        const citizen = await Citizen.findById(id);
        if (!citizen) {
            return next(new HttpError('User not found', 404));
        }
        res.json({ user: citizen });
    } catch (err) {
        return next(new HttpError('Something went wrong, could not find user.', 500));
    }
};

const createUser = async (req, res, next) => {
    const { fullName, email, password, phone, addressState, addressDistrict } = req.body;

    try {
        const existingUser = await Citizen.findByEmail(email);
        if (existingUser) {
            return next(new HttpError('User already exists with this email', 422));
        }

        const newCitizen = await Citizen.create({
            fullName,
            email,
            password,
            phone,
            addressState,
            addressDistrict
        });

        res.status(201).json({ user: newCitizen });
    } catch (err) {
        return next(new HttpError('Creating user failed, please try again.', 500));
    }
};

const loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const citizen = await Citizen.findByEmail(email);
        if (!citizen || citizen.password !== password) {
            return next(new HttpError('Invalid credentials', 401));
        }

        res.json({ user: citizen, message: 'Login successful' });
    } catch (err) {
        return next(new HttpError('Login failed, please try again.', 500));
    }
};

const getCasesByUserId = async (req, res, next) => {
    const { id } = req.params;
    const { filter } = req.body;

    try {
        const citizen = await Citizen.findById(id);
        if (!citizen) {
            return next(new HttpError('User not found', 404));
        }

        const allCases = await Case.findByUserId(id);
        const closedCases = await Case.findByUserId(id, 'closed');

        const totalCasesLength = allCases.length;
        const closedCasesLength = closedCases.length;
        const activeCasesLength = totalCasesLength - closedCasesLength;

        let filteredCases = allCases;
        if (filter && filter.status) {
            filteredCases = await Case.findByUserId(id, filter.status);
        }

        res.json({
            activeCases: activeCasesLength,
            closedCases: closedCasesLength,
            totalCases: totalCasesLength,
            allCases: filteredCases
        });
    } catch (err) {
        return next(new HttpError('Something went wrong, could not find cases.', 500));
    }
};

const resetPassword = async (req, res, next) => {
    const { id } = req.params;
    const { new_password } = req.body;

    try {
        const citizen = await Citizen.findById(id);
        if (!citizen) {
            return next(new HttpError('User not found', 404));
        }

        await citizen.updatePassword(new_password);

        const notification = await Notification.create({
            userId: id,
            message: "Password updated successfully."
        });

        res.status(200).json({ message: "Password updated", user: citizen });
    } catch (error) {
        return next(new HttpError('Error updating password.', 500));
    }
};

module.exports = {
    getUserByID,
    createUser,
    loginUser,
    getCasesByUserId,
    resetPassword
};
