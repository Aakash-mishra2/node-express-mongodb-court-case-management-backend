const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const notif = require('../controllers/notifications-routes-controller');

router.get('/:userId', notif.getAll);
router.post('/create', notif.createNotif);

module.exports = router;