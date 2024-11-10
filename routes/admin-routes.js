const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const admin = require('../controllers/admin-routes-controller');

router.get('/:cID', admin.getCasebyID);
router.get('/user/:uID', admin.getCasesByUserID);
router.post('/newcase', admin.createCase);
router.post("/createCase", admin.createNewCase);
router.patch('/update_case', admin.updateHearing);
router.patch('/update_lawyer', admin.updateLawyer);
router.delete('/remove/:cID', admin.withdrawCase);
router.post('/generate-otp', admin.generateOtp);
router.post('/verify-post', admin.verifyOtp);

module.exports = router;
