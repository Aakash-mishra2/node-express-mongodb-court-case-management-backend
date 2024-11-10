const express = require('express');
const app = express();
const Twilio = require("twilio");
require("dotenv").config();


app.use(express.json());
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const messagingServiceId = process.env.MESSAGING_SERVICE_ID;
const verifyServiceId = process.env.VERIFY_SERVICE_ID;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// const firebaseConfig = {
//     apiKey: "AIzaSyDcPFR8XVse7dEbzVN6pO29NCbwudCWTKg",
//     authDomain: "ccms-2c1f2.firebaseapp.com",
//     projectId: "ccms-2c1f2",
//     storageBucket: "ccms-2c1f2.firebasestorage.app",
//     messagingSenderId: "777265489131",
//     appId: "1:777265489131:web:38ad33e777bf6957c68aae",
//     measurementId: "G-FPDR38YQJE"
// };

//Initialize firebase
// const app = initializeApp(firebaseConfig)

// if (!firebase.apps.length) {
//     firebase.initializeApp(firebaseConfig);
// }

// export const sendOtp = (phoneNumber) => {
//     const recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');

//     return firebase.auth().signInWithPhoneNumber(phoneNumber, recaptchaVerifier);
// };


// Then in your component, call sendOtp with the phone number:
// sendOtp("+1234567890")
//     .then((confirmationResult) => {
//         const verificationCode = prompt("Please enter the verification code sent to your phone:");
//         return confirmationResult.confirm(verificationCode);
//     })
//     .then((result) => {
//         // User successfully verified
//         console.log("User is verified", result.user);
//     })
//     .catch((error) => {
//         console.error("Error verifying OTP:", error);
//     });

const client = new Twilio(accountSid, authToken);

const generateOtp = async (req, res) => {
    const { phoneNumber } = req.body;
    try {
        // send the otp to the provided phone number
        const message = await client.verify.v2
            .services(verifyServiceId)
            .verifications.create({ to: phoneNumber, channel: "sms" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const verifyOtp = async (req, res) => {
    const { phoneNumber, otp } = req.body;
    try {
        // Verify the OTP using the Twilio Verify API
        const verificationCheck = await client.verify.v2
            .services(verifyServiceId)
            .verificationChecks.create({
                to: `${phoneNumber}`,
                code: otp,
            });

        if (verificationCheck.status === "approved") {
            res.json({ isVerified: true });
        } else {
            res.json({ isVerified: false });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const sendPhoneCode = async (req, res, next) => {
    const { phoneNumber } = req.body;
    console.log('triger send verification!');
    if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    try {
        const verification = await client.verify.v2
            .services(verifyServiceId)
            .verifications.create({ to: phoneNumber, channel: 'sms' });

        res.status(200).json({ message: 'Verification code sent successfully!', verification });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPhoneCode = async (req, res, next) => {
    const { phoneNumber, code } = req.body;

    if (!phoneNumber || !code) {
        return res.status(400).json({ error: 'Phone number and code are required' });
    }

    try {
        const verificationCheck = await client.verify.v2
            .services(process.env.TWILIO_VERIFY_SERVICE_SID)
            .verificationChecks.create({ to: phoneNumber, code });

        if (verificationCheck.status === 'approved') {
            res.status(200).json({ message: 'Phone number verified successfully!' });
        } else {
            res.status(400).json({ error: 'Invalid code. Verification failed.' });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.sendPhoneCode = sendPhoneCode;
exports.getPhoneCode = getPhoneCode;
exports.generateOtp = generateOtp;
exports.verifyOtp = verifyOtp;