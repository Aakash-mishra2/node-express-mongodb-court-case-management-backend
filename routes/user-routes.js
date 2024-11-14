const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const user = require('../controllers/user-routes-controller');

router.get('/single/:Uid', user.getUserByID);
router.post('/signup',
    [
        check('name').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({ min: 6 })
    ]
    , user.createUser);
router.post('/login', user.loginUser);
module.exports = router;