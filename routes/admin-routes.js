const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const admin = require('../controllers/admin-routes-controller');

router.get('/:aId', admin.getAllCases);
router.post('/newcase', admin.createNewCase);
router.patch('/update-case/:id', admin.updateHearing);
router.patch('/update-lawyer/:id', admin.updateLawyer);
router.delete('/remove/:cID', admin.withdrawCase);
router.post('/generate-otp', admin.generateOtp);
router.post('/verify-post', admin.verifyOtp);

module.exports = router;
