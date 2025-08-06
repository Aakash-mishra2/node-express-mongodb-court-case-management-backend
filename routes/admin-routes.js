const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const admin = require('../controllers/admin-routes-controller');

router.use(auth);
router.get('/:aId', admin.getAllCases);
router.post('/newcase', admin.createNewCase);
router.put('/update-case/:id', admin.updateHearing);
router.patch('/update/:id', admin.updatesAndVerification);
router.delete('/remove/:cID', admin.withdrawCase);

module.exports = router;
