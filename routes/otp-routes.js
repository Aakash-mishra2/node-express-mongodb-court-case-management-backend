const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const otpcontroller = require('../controllers/otp-routes-controller');

router.post("/generate-otp", otpcontroller.generateOtp);
router.post("/verify-otp", otpcontroller.verifyOtp);

// Add protected OTP routes below
// router.use(auth);

module.exports = router;
