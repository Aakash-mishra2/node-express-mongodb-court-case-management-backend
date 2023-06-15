const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const admin = require('../controllers/admin-routes-controller');

router.get('/:caseID', admin.fetchCase);
router.get('/user/:uID', admin.caseByUser);
router.post('/newcase',
    [
        check('court').not().isEmpty(),
        check('description').isLength({ min: 10 }),
    ],
    admin.newCase);
router.patch('/update/:cid', admin.hearing);
router.delete('/remove/:did', admin.withdraw);

module.exports = router;
