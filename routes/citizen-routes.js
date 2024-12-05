const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');

const plaintiff = require('../controllers/citizen-routes-controller');

const authorize = (roles) => (req, res, next) => {
    const token = req.cookies.authToken;
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Access denied. " });
    }

    next();
}

router.get('/single/:Uid', auth, plaintiff.getUserByID);
router.post('/signup',
    [
        check('name').not().isEmpty(),
        check('email').isEmail(),
        check('password').isLength({ min: 6 })
    ]
    , plaintiff.createUser);
router.post('/login', plaintiff.loginUser);
router.get('/:id', plaintiff.getCasesByUserId);
router.patch('/reset-password/:id', auth, plaintiff.resetPassword);
//router.get("/account-details", auth, authorize(["user"]), plaintiff.accountDetails);




module.exports = router;