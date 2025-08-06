const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const notif = require('../controllers/notifications-routes-controller');

router.use(auth);
router.get('/:userId', notif.getAll);
router.post('/create', notif.createNotif);

module.exports = router;
