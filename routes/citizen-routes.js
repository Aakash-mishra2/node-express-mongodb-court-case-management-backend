const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const plaintiff = require('../controllers/citizen-routes-controller');

router.get('/:cid', plainiff.fetchUser);
router.post('/newuser', [
    check('id')
        .not()
        .isEmpty()
], plaintiff.createUser);

module.exports = router;