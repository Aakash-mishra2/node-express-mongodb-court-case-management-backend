const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const admin = require('../controllers/admin-routes-controller');

router.get('/', admin.getAllCases);
router.post('/newcase', admin.createNewCase);
router.put('/update-case/:id', admin.updateHearing);
router.patch('/update/:id', admin.updatesAndVerification);
router.delete('/remove/:cID', admin.withdrawCase);

module.exports = router;
