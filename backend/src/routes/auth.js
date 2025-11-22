const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        // Check if user exists
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert new user
        db.run(
            'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
            [email, hashedPassword, name],
            function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            res.status(201).json({
                id: this.lastID,
                email: email,
                name: name
            });
            }
        );
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    });

    // Login
    router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'boutique-secret',
            { expiresIn: '24h' }
        );

        res.json({
            accessToken: token,
            user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
            }
        });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    });

    // Get user profile
    router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
        return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'boutique-secret');
        
        db.get('SELECT id, email, name, role FROM users WHERE id = ?', [decoded.userId], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;