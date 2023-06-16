const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const admin = require('../controllers/admin-routes-controller');

router.get('/:cID', admin.getCasebyID);
router.get('/user/:uID', admin.getCasesByUserID);
router.post('/newcase',
    [
        check('court').not().isEmpty(),
        check('description').isLength({ min: 10 }),
    ],
    admin.createCase);
router.patch('/update/:cid', admin.updateHearing);
router.delete('/remove/:did', admin.withdrawCase);

module.exports = router;
