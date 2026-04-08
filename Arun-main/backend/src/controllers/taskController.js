const { query } = require('../db');

// ── GET /api/tasks ────────────────────────────────────────────────────────────
exports.getTasks = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { status, priority, search } = req.query;

        let sql = 'SELECT * FROM tasks WHERE user_id = $1';
        const vals = [userId];
        let idx = 2;

        if (status) {
            sql += ` AND status = $${idx++}`;
            vals.push(status);
        }
        if (priority) {
            sql += ` AND priority = $${idx++}`;
            vals.push(priority);
        }
        if (search) {
            sql += ` AND (title ILIKE $${idx} OR description ILIKE $${idx})`;
            vals.push(`%${search}%`);
            idx++;
        }

        sql += ' ORDER BY created_at DESC';

        const result = await query(sql, vals);
        res.json({ tasks: result.rows });
    } catch (err) {
        next(err);
    }
};

// ── GET /api/tasks/stats ──────────────────────────────────────────────────────
exports.getStats = async (req, res, next) => {
    try {
        const result = await query(
            `SELECT
         COUNT(*)                                        AS total,
         COUNT(*) FILTER (WHERE status = 'todo')        AS todo,
         COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress,
         COUNT(*) FILTER (WHERE status = 'done')        AS done,
         COUNT(*) FILTER (WHERE priority = 'high')      AS high_priority
       FROM tasks WHERE user_id = $1`,
            [req.user.id]
        );
        res.json({ stats: result.rows[0] });
    } catch (err) {
        next(err);
    }
};

// ── POST /api/tasks ───────────────────────────────────────────────────────────
exports.createTask = async (req, res, next) => {
    try {
        const { title, description, status, priority, due_date } = req.body;

        const result = await query(
            `INSERT INTO tasks (user_id, title, description, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [req.user.id, title, description || null, status || 'todo', priority || 'medium', due_date || null]
        );

        res.status(201).json({ task: result.rows[0] });
    } catch (err) {
        next(err);
    }
};

// ── GET /api/tasks/:id ────────────────────────────────────────────────────────
exports.getTask = async (req, res, next) => {
    try {
        const result = await query(
            'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Task not found' });
        res.json({ task: result.rows[0] });
    } catch (err) {
        next(err);
    }
};

// ── PUT /api/tasks/:id ────────────────────────────────────────────────────────
exports.updateTask = async (req, res, next) => {
    try {
        const { title, description, status, priority, due_date } = req.body;

        // Build dynamic SET clause – only update supplied fields
        const fields = [];
        const vals = [];
        let idx = 1;

        if (title !== undefined) { fields.push(`title = $${idx++}`); vals.push(title); }
        if (description !== undefined) { fields.push(`description = $${idx++}`); vals.push(description); }
        if (status !== undefined) { fields.push(`status = $${idx++}`); vals.push(status); }
        if (priority !== undefined) { fields.push(`priority = $${idx++}`); vals.push(priority); }
        if (due_date !== undefined) { fields.push(`due_date = $${idx++}`); vals.push(due_date); }

        if (!fields.length) {
            return res.status(400).json({ error: 'No fields provided for update' });
        }

        vals.push(req.params.id, req.user.id);

        const result = await query(
            `UPDATE tasks SET ${fields.join(', ')}
       WHERE id = $${idx++} AND user_id = $${idx}
       RETURNING *`,
            vals
        );

        if (!result.rows.length) return res.status(404).json({ error: 'Task not found' });
        res.json({ task: result.rows[0] });
    } catch (err) {
        next(err);
    }
};

// ── DELETE /api/tasks/:id ─────────────────────────────────────────────────────
exports.deleteTask = async (req, res, next) => {
    try {
        const result = await query(
            'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
            [req.params.id, req.user.id]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Task not found' });
        res.json({ message: 'Task deleted', id: result.rows[0].id });
    } catch (err) {
        next(err);
    }
};
