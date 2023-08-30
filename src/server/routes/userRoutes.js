const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db/database'); 
const jwt = require('jsonwebtoken');

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

            // Store refreshToken in your new refreshTokens table
            const insert = db.prepare('INSERT INTO refreshTokens (user_id, token) VALUES (?, ?)');
            insert.run(user.id, refreshToken);
            res.cookie('token', accessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 15 * 60 * 1000 }); // 15 minutes
            res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days


            const { id, username} = user;
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

    res.json({ message: "Logged out successfully" });
});

router.post('/refreshToken', (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(403).json({ error: 'No token provided' });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Failed to authenticate token' });
        }

        // Check if refreshToken is still valid in the refreshTokens table
        const storedToken = db.prepare('SELECT token FROM refreshTokens WHERE user_id = ?').get(decoded.id).token;
        
        if (!storedToken || storedToken !== refreshToken) {
            return res.status(403).json({ error: 'Refresh token is not valid' });
        }

        const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        res.cookie('token', accessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 15 * 60 * 1000 }); // 15 minutes
        res.json({ message: 'Token refreshed' });

    });
});

module.exports = router;