const express = require('express');
const nodemailer = require("nodemailer");
const otpGenerator = require('otp-generator');
const bodyParser = require('body-parser');
const HttpError = require('../models/http_error');
require("dotenv").config();
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false }
});
const app = express();
app.use(express.json());
app.use(bodyParser.json());


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
    const client = await pool.connect();
    let loggedInUser;
    try {
        const result = await client.query('SELECT * FROM citizens WHERE email = $1', [email]);
        loggedInUser = result.rows[0];
    } catch (err) {
        console.error(err);
        const error = new HttpError('Database query failed', 500);
        client.release();
        return next(error);
    }
    client.release();

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

module.exports = {
    generateOtp,
    verifyOtp,
};