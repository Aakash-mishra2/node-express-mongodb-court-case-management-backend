const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const plaintiff = require('../controllers/citizen-routes-controller');
router.get('/', plaintiff.allUser);
router.get('/single/:Uid', plainiff.fetchUser);
router.post('/signup',
    [
        check('name').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({ min: 6 })
    ]
    , plaintiff.createUser);
router.post('/login', plaintiff.logUser);

module.exports = router;