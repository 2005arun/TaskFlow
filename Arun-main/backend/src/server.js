const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const { query } = require('./db');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const errorHandler = require('./middleware/error');

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

// ── Security & Utilities ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Origin is not allowed by CORS'));
    },
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
    try {
        await query('SELECT 1');
        res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
    } catch (err) {
        res.status(503).json({ status: 'error', database: 'unavailable', error: err.message });
    }
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ── Centralised error handler ─────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 TaskFlow API running on port ${PORT}`);
});

module.exports = app;
