const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

const authenticateJWT = (req, res, next) => {
    const token = req.cookies.token; // Get the token from the cookies

    if (token) {
        jwt.verify(token, jwtSecret, (err, user) => {
            if (err) {
                res.status(403).json({ error: 'Invalid token' });
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401); // Unauthorized
    }
};

module.exports = authenticateJWT;