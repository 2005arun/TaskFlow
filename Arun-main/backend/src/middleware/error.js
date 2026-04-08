/**
 * Centralised error handler.
 * Must be registered last with app.use().
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
    console.error('[Error]', err.message);

    // PostgreSQL unique-violation
    if (err.code === '23505') {
        return res.status(409).json({ error: 'A record with that value already exists' });
    }
    // PostgreSQL check-constraint violation
    if (err.code === '23514') {
        return res.status(400).json({ error: 'Invalid value for a constrained field' });
    }

    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({ error: message });
};

module.exports = errorHandler;
