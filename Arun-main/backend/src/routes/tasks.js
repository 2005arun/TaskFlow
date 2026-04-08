const router = require('express').Router();
const { body, param, query } = require('express-validator');
const taskController = require('../controllers/taskController');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');

// All task routes require a valid JWT
router.use(authenticate);

// ── Validation chains ─────────────────────────────────────────────────────────
const createRules = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('status').optional().isIn(['todo', 'in_progress', 'done'])
        .withMessage('status must be todo | in_progress | done'),
    body('priority').optional().isIn(['low', 'medium', 'high'])
        .withMessage('priority must be low | medium | high'),
    body('due_date').optional({ nullable: true }).isISO8601().withMessage('due_date must be a valid date'),
];

const updateRules = [
    param('id').isInt().withMessage('Task id must be an integer'),
    body('title').optional().trim().notEmpty(),
    body('status').optional().isIn(['todo', 'in_progress', 'done']),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('due_date').optional({ nullable: true }).isISO8601(),
];

// ── Routes ────────────────────────────────────────────────────────────────────
router.get('/', taskController.getTasks);
router.get('/stats', taskController.getStats);
router.post('/', createRules, validate, taskController.createTask);
router.get('/:id', taskController.getTask);
router.put('/:id', updateRules, validate, taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
