const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const plaintiff = require('../controllers/citizen-routes-controller');

router.post('/signup',
    [
        check('name').not().isEmpty(),
        check('email').isEmail(),
        check('password').isLength({ min: 6 })
    ]
    , plaintiff.createUser);
router.post('/login', plaintiff.loginUser);

router.use(auth);
router.get('/single/:Uid', plaintiff.getUserByID);
router.get('/:id', plaintiff.getCasesByUserId);
router.patch('/reset-password/:id', plaintiff.resetPassword);

module.exports = router;
