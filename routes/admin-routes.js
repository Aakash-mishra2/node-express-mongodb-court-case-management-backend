const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const admin = require('../controllers/admin-routes-controller');

router.get('/:cID', admin.getCasebyID);
router.get('/user/:uID', admin.getCasesByUserID);
router.post('/newcase', admin.createCase);
router.patch('/update_case', admin.updateHearing);
router.patch('/update_lawyer', admin.updateLawyer);
router.delete('/remove/:cID', admin.withdrawCase);

module.exports = router;
