const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db/database'); 
const jwt = require('jsonwebtoken');
const authenticateJWT = require('../middleware/authMiddleware');


router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const userExists = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, email);
        if (userExists) {
            return res.status(409).json({ message: 'User already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        const stmt = db.prepare('INSERT INTO users (username, email, hashed_password) VALUES (?, ?, ?)');
        stmt.run(username, email, hashedPassword);

        res.json({ message: "User registered successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error.');
    }
});

router.post('/login', (req, res) => {
    console.log(req.body);
    const { username, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user) {
        return res.status(400).json({ message: "User not found." });
    }

    bcrypt.compare(password, user.hashed_password).then(isMatch => {
        if (isMatch) {
            const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
            const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

            // Check if refreshToken already exists in the table
            const existingToken = db.prepare('SELECT * FROM refreshTokens WHERE token = ?').get(refreshToken);
            
            if (!existingToken) {
                // Store refreshToken in your refreshTokens table
                const insert = db.prepare('INSERT INTO refreshTokens (user_id, token) VALUES (?, ?)');
                insert.run(user.id, refreshToken);
            }

            res.cookie('token', accessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 15 * 60 * 1000 }); // 15 minutes
            res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days

            const { id, username } = user;
            const userResponse = { id, username }; // Only send non-sensitive details
            res.json({ user: userResponse });

        } else {
            res.status(400).json({ message: "Invalid credentials." });
        }
    });
});



router.post('/logout', (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({ message: "No refresh token provided" });
    }

    // Invalidate the refresh token by removing it from the database
    const invalidateToken = db.prepare('DELETE FROM refreshTokens WHERE token = ?');
    invalidateToken.run(refreshToken);

    // Clear the client-side cookies (assuming you store tokens in cookies)
    res.clearCookie('token');
    res.clearCookie('refreshToken');

    res.json({ message: "Logged out successfully" });
});


router.post('/refreshToken', (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    console.log(refreshToken);

    if (!refreshToken) {
        return res.status(403).json({ error: 'No token provided' });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Failed to authenticate token' });
        }
        console.log("Decoded Payload:", decoded);


        // Check if refreshToken is still valid in the refreshTokens table
        const storedToken = db.prepare('SELECT token FROM refreshTokens WHERE user_id = ?').get(decoded.id).token;
        console.log('stored: ', storedToken);
        if (!storedToken || storedToken !== refreshToken) {
            return res.status(403).json({ error: 'Refresh token is not valid' });
        }

        let accessToken;
        try {
            accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
            console.log("Generated Access Token:", accessToken);
        } catch (err) {
            console.error("Error generating access token:", err);
            return res.status(500).json({ error: 'Error generating access token' });
        }

        console.log(accessToken);
        res.json({ message: 'Token refreshed' });
        console.log(res.json);

    });
});

router.get('/checkAuthStatus', authenticateJWT, (req, res) => {
    const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(req.user.id);

    if (!user) {
        return res.status(400).json({ message: "User not found." });
    }

    // Only send non-sensitive details
    const { id, username } = user;
    const userResponse = { id, username };

    res.json({ user: userResponse });
});


module.exports = router;