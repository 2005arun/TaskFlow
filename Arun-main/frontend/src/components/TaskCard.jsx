import './TaskCard.css'

const priorityLabel = { high: 'High', medium: 'Medium', low: 'Low' }
const statusLabel = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' }

export default function TaskCard({ task, onEdit, onDelete }) {
    const dueDateStr = task.due_date
        ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : null

    const isOverdue = task.due_date && task.status !== 'done'
        && new Date(task.due_date) < new Date()

    return (
        <div className="task-card fade-in">
            {/* Header row */}
            <div className="tc-header">
                <span className={`badge badge-${task.priority}`}>
                    {priorityLabel[task.priority]}
                </span>
                <div className="tc-actions">
                    <button className="btn-icon tc-btn" onClick={() => onEdit(task)} title="Edit task">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </button>
                    <button className="btn-icon tc-btn tc-btn-del" onClick={() => onDelete(task.id)} title="Delete task">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6" /><path d="M14 11v6" />
                            <path d="M9 6V4h6v2" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Title */}
            <h3 className={`tc-title ${task.status === 'done' ? 'tc-done' : ''}`}>{task.title}</h3>

            {/* Description */}
            {task.description && (
                <p className="tc-desc">{task.description}</p>
            )}

            {/* Footer */}
            <div className="tc-footer">
                <span className={`badge badge-${task.status}`}>{statusLabel[task.status]}</span>
                {dueDateStr && (
                    <span className={`tc-due ${isOverdue ? 'tc-overdue' : ''}`}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        {dueDateStr}
                    </span>
                )}
            </div>
        </div>
    )
}
