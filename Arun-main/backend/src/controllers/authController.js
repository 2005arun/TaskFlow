const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query } = require('../db');

/** Generate a signed JWT for a user row */
const signToken = (user) =>
    jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

// ── POST /api/auth/register ───────────────────────────────────────────────────
exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Check duplicate
        const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const hashed = await bcrypt.hash(password, 12);
        const result = await query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
            [name, email, hashed]
        );

        const user = result.rows[0];
        const token = signToken(user);

        res.status(201).json({ token, user });
    } catch (err) {
        next(err);
    }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = signToken(user);
        const { password: _pw, ...safeUser } = user;

        res.json({ token, user: safeUser });
    } catch (err) {
        next(err);
    }
};

// ── POST /api/auth/google ────────────────────────────────────────────────────
exports.googleLogin = async (req, res, next) => {
    try {
        const { credential } = req.body;
        if (!credential || !process.env.GOOGLE_CLIENT_ID) {
            return res.status(400).json({ error: 'Google sign-in is not configured' });
        }

        const googleResponse = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
        );
        if (!googleResponse.ok) {
            return res.status(401).json({ error: 'Invalid Google sign-in token' });
        }

        const googleUser = await googleResponse.json();
        if (
            googleUser.aud !== process.env.GOOGLE_CLIENT_ID ||
            !['true', true].includes(googleUser.email_verified) ||
            !googleUser.email
        ) {
            return res.status(401).json({ error: 'Google account could not be verified' });
        }

        const email = googleUser.email.toLowerCase();
        const existing = await query('SELECT * FROM users WHERE email = $1', [email]);
        let user = existing.rows[0];

        if (!user) {
            const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);
            const result = await query(
                'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
                [googleUser.name || email.split('@')[0], email, passwordHash]
            );
            user = result.rows[0];
        }

        const token = signToken(user);
        const { password: _pw, ...safeUser } = user;
        res.json({ token, user: safeUser });
    } catch (err) {
        next(err);
    }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
exports.me = async (req, res, next) => {
    try {
        const result = await query(
            'SELECT id, name, email, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
        res.json({ user: result.rows[0] });
    } catch (err) {
        next(err);
    }
};
