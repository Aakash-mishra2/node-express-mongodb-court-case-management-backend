const express = require('express');
const nodemailer = require("nodemailer");
const otpGenerator = require('otp-generator');
const bodyParser = require('body-parser');
const citizen = require('../models/citizen');
const HttpError = require('../models/http_error');

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(bodyParser.json());

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const messagingServiceId = process.env.MESSAGING_SERVICE_ID;
const verifyServiceId = process.env.VERIFY_SERVICE_ID;
//const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;


//const client = new Twilio(accountSid, authToken);

//mock db to store otp
const otpStore = new Map();

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.PASSWORD,
    },
});

const generateOtp = async (req, res, next) => {
    const { email, password } = req.body;
    console.log('req body', req.body);
    if (!email) {
        const error = new HttpError('Email is required! Try again', 500)
        return next(error);
    }

    //verify password
    const loggedInUser = await citizen.findOne({ email: email });

    if (!loggedInUser || loggedInUser.password !== password) {
        const error = new HttpError("Could not find this User. Try again!")
        return next(error);
    }

    // Generate a 6-digit OTP
    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });

    // Save the OTP with an expiry time of 5 minutes
    otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    const mailOptions = {
        from: process.env.USERNAME,
        to: req.body.email,
        subject: " Your OTP for reset password.",
        text: `Your OTP for password reset is ${otp}. This otp is valid for 5 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email: ', error);
            const error = new HttpError('Error sending OTP', 500);
            return next(error);
        }
        res.status(200).json({ message: 'OTP sent succesfully', info });
    });
};


const verifyOtp = async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        const error = new HttpError('Enter Valid OTP. Try again', 500);
        return next(error);
    }

    const storedOtpData = otpStore.get(email);
    if (!storedOtpData) {
        const error = new HttpError('Invalid or expired OTP', 400);
        return next(error);
    }


    const { otp: storedOtp, expiresAt } = storedOtpData;
    //console.log('stored', storedOtp);
    //console.log('entered otp', otp);
    // Check if the OTP matches and is not expired
    if (storedOtp !== otp) {
        return next(new HttpError("Wrong OTP", 500));
    }

    if (Date.now() > expiresAt) {
        otpStore.delete(email);
        return next(new HttpError("OTP Expired", 500));
    }

    //OTP is valid, clear stored map
    otpStore.delete(email);
    res.status(200).json({ message: 'OTP verified succesfully' });
};

// const sendPhoneCode = async (req, res, next) => {
//     const { phoneNumber } = req.body;
//     if (!phoneNumber) {
//         return next(new HttpError('Phone number is Required!', 500));
//     }

//     try {
//         const verification = await client.verify.v2
//             .services(verifyServiceId)
//             .verifications.create({ to: phoneNumber, channel: 'sms' });

//         res.status(200).json({ message: 'Verification code sent successfully!', verification });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// const getPhoneCode = async (req, res, next) => {
//     const { phoneNumber, code } = req.body;

//     if (!phoneNumber || !code) {
//         //return res.status(400).json({ error: 'Phone number and code are required' });
//         return next(HttpError("Phone number and code are required!"), 500);
//     }

//     try {
//         const verificationCheck = await client.verify.v2
//             .services(process.env.TWILIO_VERIFY_SERVICE_SID)
//             .verificationChecks.create({ to: phoneNumber, code });

//         if (verificationCheck.status === 'approved') {
//             //res.status(200).json({ message: 'Phone number verified successfully!' });
//             return next(HttpError("Phone number verified successfully!"), 500);
//         } else {
//             return next(HttpError("Invalid code. Verification failed.", 500))
//         }
//     }
//     catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };


// exports.sendPhoneCode = sendPhoneCode;
// exports.getPhoneCode = getPhoneCode;
exports.generateOtp = generateOtp;
exports.verifyOtp = verifyOtp;