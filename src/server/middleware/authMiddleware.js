const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

const authenticateJWT = (req, res, next) => {
    const token = req.cookies.token; 

    if (!token) {
        return res.status(401).json({ error: 'No token provided, authentication failed.' }); 
    }

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            console.error("JWT verification failed:", err);
            return res.status(403).json({ error: 'Invalid or expired token.' });
        }

        req.user = user;
        next();
    });
};

module.exports = authenticateJWT;