import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import './TaskModal.css'

const EMPTY = { title: '', description: '', status: 'todo', priority: 'medium', due_date: '' }

export default function TaskModal({ task, onClose, onSave }) {
    const [form, setForm] = useState(EMPTY)
    const [loading, setLoading] = useState(false)
    const isEdit = !!task

    useEffect(() => {
        if (task) {
            setForm({
                title: task.title || '',
                description: task.description || '',
                status: task.status || 'todo',
                priority: task.priority || 'medium',
                due_date: task.due_date ? task.due_date.slice(0, 10) : '',
            })
        } else {
            setForm(EMPTY)
        }
    }, [task])

    const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const submit = async (e) => {
        e.preventDefault()
        if (!form.title.trim()) { toast.error('Title is required'); return }
        setLoading(true)
        try {
            await onSave({ ...form, due_date: form.due_date || null }, task?.id)
            onClose()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save task')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                {/* Header */}
                <div className="tm-header">
                    <h3>{isEdit ? 'Edit Task' : 'New Task'}</h3>
                    <button className="btn-icon" onClick={onClose} id="close-modal-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <hr className="divider" style={{ margin: '16px 0' }} />

                <form onSubmit={submit} className="tm-form">
                    <div className="form-group">
                        <label htmlFor="task-title">Title *</label>
                        <input id="task-title" className="form-control" name="title" type="text"
                            placeholder="What needs to be done?" value={form.title} onChange={handle} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="task-desc">Description</label>
                        <textarea id="task-desc" className="form-control tm-textarea" name="description"
                            placeholder="Add more details..." value={form.description} onChange={handle} rows={3} />
                    </div>

                    <div className="tm-row">
                        <div className="form-group">
                            <label htmlFor="task-priority">Priority</label>
                            <select id="task-priority" className="form-control" name="priority" value={form.priority} onChange={handle}>
                                <option value="low">🟢 Low</option>
                                <option value="medium">🟡 Medium</option>
                                <option value="high">🔴 High</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="task-status">Status</label>
                            <select id="task-status" className="form-control" name="status" value={form.status} onChange={handle}>
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="done">Done</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="task-due">Due Date</label>
                        <input id="task-due" className="form-control" name="due_date" type="date"
                            value={form.due_date} onChange={handle} />
                    </div>

                    <div className="tm-actions">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button id="save-task-btn" type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <span className="spinner" /> : isEdit ? 'Save Changes' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
