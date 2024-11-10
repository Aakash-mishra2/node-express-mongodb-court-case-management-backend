const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const otpcontroller = require('../controllers/otp-routes-controller');

router.post("/send-verification", otpcontroller.sendPhoneCode);

router.post("/verify-code", otpcontroller.getPhoneCode);

router.post("/generate-otp", otpcontroller.generateOtp);

router.post("/verify-otp", otpcontroller.verifyOtp);
module.exports = router;

