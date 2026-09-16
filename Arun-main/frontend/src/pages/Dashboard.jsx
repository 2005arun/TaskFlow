import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import TaskCard from '../components/TaskCard'
import TaskModal from '../components/TaskModal'
import './Dashboard.css'

const COLUMNS = [
    { key: 'todo', label: 'To Do', icon: '📋' },
    { key: 'in_progress', label: 'In Progress', icon: '⚡' },
    { key: 'done', label: 'Done', icon: '✅' },
]

export default function Dashboard() {
    const { user } = useAuth()
    const [tasks, setTasks] = useState([])
    const [stats, setStats] = useState(null)
    const [modal, setModal] = useState(false)
    const [editTask, setEditTask] = useState(null)
    const [filters, setFilters] = useState({ status: '', priority: '', search: '' })

    // ── Load from the API backed by Neon PostgreSQL ─────────────────────────────
    const refresh = useCallback(async () => {
        const params = Object.fromEntries(
            Object.entries(filters).filter(([, value]) => value)
        )
        const [tasksResponse, statsResponse] = await Promise.all([
            api.get('/tasks', { params }),
            api.get('/tasks/stats'),
        ])
        setTasks(tasksResponse.data.tasks)
        setStats(statsResponse.data.stats)
    }, [user, filters])

    useEffect(() => {
        refresh().catch(() => toast.error('Failed to load tasks'))
    }, [refresh])

    // ── CRUD ─────────────────────────────────────────────────────────────────────
    const saveTask = async (data, id) => {
        if (id) {
            await api.put(`/tasks/${id}`, data)
            toast.success('Task updated')
        } else {
            await api.post('/tasks', data)
            toast.success('Task created 🎉')
        }
        await refresh()
    }

    const deleteTask = async (id) => {
        if (!window.confirm('Delete this task?')) return
        try {
            await api.delete(`/tasks/${id}`)
            toast.success('Task deleted')
            await refresh()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to delete task')
        }
    }

    const openNew = () => { setEditTask(null); setModal(true) }
    const openEdit = (task) => { setEditTask(task); setModal(true) }
    const closeModal = () => setModal(false)

    const filterChange = (e) =>
        setFilters(f => ({ ...f, [e.target.name]: e.target.value }))

    const clearFilters = () => setFilters({ status: '', priority: '', search: '' })
    const hasFilters = filters.status || filters.priority || filters.search

    const grouped = COLUMNS.reduce((acc, col) => {
        acc[col.key] = tasks.filter(t => t.status === col.key)
        return acc
    }, {})

    return (
        <div className="dashboard">
            <Navbar onNewTask={openNew} />

            <div className="dashboard-content">
                <header className="dashboard-heading fade-in">
                    <div>
                        <p className="eyebrow">Your workspace</p>
                        <h1>Good to see you, {user?.name?.split(' ')[0] || 'there'}.</h1>
                        <p className="dashboard-subtitle">Keep the important work moving forward.</p>
                    </div>
                    <div className="date-stamp">{new Intl.DateTimeFormat('en', { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date())}</div>
                </header>

                {/* ── Stats Bar ──────────────────────────────────────────────── */}
                {stats && (
                    <div className="stats-bar fade-in">
                        <div className="stat-card">
                            <span className="stat-value">{stats.total}</span>
                            <span className="stat-label">Total Tasks</span>
                        </div>
                        <div className="stat-card stat-todo">
                            <span className="stat-value">{stats.todo}</span>
                            <span className="stat-label">To Do</span>
                        </div>
                        <div className="stat-card stat-progress">
                            <span className="stat-value">{stats.in_progress}</span>
                            <span className="stat-label">In Progress</span>
                        </div>
                        <div className="stat-card stat-done">
                            <span className="stat-value">{stats.done}</span>
                            <span className="stat-label">Completed</span>
                        </div>
                        <div className="stat-card stat-high">
                            <span className="stat-value">{stats.high_priority}</span>
                            <span className="stat-label">High Priority</span>
                        </div>
                    </div>
                )}

                {/* ── Filter Bar ─────────────────────────────────────────────── */}
                <div className="filter-bar fade-in">
                    <div className="filter-search-wrap">
                        <svg className="filter-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input id="search-tasks" className="form-control filter-search" name="search" type="text"
                            placeholder="Search tasks..." value={filters.search} onChange={filterChange} />
                    </div>

                    <select id="filter-status" className="form-control filter-select" name="status" value={filters.status} onChange={filterChange}>
                        <option value="">All Statuses</option>
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                    </select>

                    <select id="filter-priority" className="form-control filter-select" name="priority" value={filters.priority} onChange={filterChange}>
                        <option value="">All Priorities</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>

                    {hasFilters && (
                        <button id="clear-filters-btn" className="btn btn-ghost filter-clear" onClick={clearFilters}>
                            Clear
                        </button>
                    )}
                </div>

                {/* ── Kanban Board ────────────────────────────────────────────── */}
                <div className="kanban-board">
                    {COLUMNS.map(col => (
                        <div key={col.key} className={`kanban-col kanban-col-${col.key}`}>
                            <div className="kanban-col-header">
                                <div className="kanban-col-title">
                                    <span>{col.icon}</span>
                                    <span>{col.label}</span>
                                </div>
                                <span className="kanban-count">{grouped[col.key].length}</span>
                            </div>

                            <div className="kanban-cards">
                                {grouped[col.key].length === 0 ? (
                                    <div className="empty-state">
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                                            <rect x="9" y="3" width="6" height="4" rx="1" ry="1" />
                                        </svg>
                                        <p style={{ fontSize: '0.82rem' }}>No tasks here</p>
                                    </div>
                                ) : (
                                    grouped[col.key].map(task => (
                                        <TaskCard key={task.id} task={task} onEdit={openEdit} onDelete={deleteTask} />
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {modal && (
                <TaskModal task={editTask} onClose={closeModal} onSave={saveTask} />
            )}
        </div>
    )
}
