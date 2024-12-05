const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET_KEY;

const auth = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];;
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        console.log('user verified', decoded);
        next();
    } catch (err) {
        res.status(400).json({ msg: 'Token is not valid.' });
    }
};

module.exports = auth;