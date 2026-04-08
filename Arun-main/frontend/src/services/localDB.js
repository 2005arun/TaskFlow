/**
 * localDB.js – Browser-based storage for TaskFlow
 * All data stored in localStorage. No backend required.
 */

const USERS_KEY = 'tf_users'
const TASKS_KEY = 'tf_tasks'

// ── Helpers ───────────────────────────────────────────────────────────────────
const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
const setUsers = (data) => localStorage.setItem(USERS_KEY, JSON.stringify(data))

const getAllTasks = () => JSON.parse(localStorage.getItem(TASKS_KEY) || '[]')
const setAllTasks = (data) => localStorage.setItem(TASKS_KEY, JSON.stringify(data))

let nextTaskId = () => {
    const tasks = getAllTasks()
    return tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const dbRegister = (name, email, password) => {
    const users = getUsers()
    if (users.find(u => u.email === email)) {
        throw new Error('Email already registered')
    }
    const user = { id: Date.now(), name, email, password, created_at: new Date().toISOString() }
    setUsers([...users, user])
    const { password: _, ...safeUser } = user
    return safeUser
}

export const dbLogin = (email, password) => {
    const users = getUsers()
    const user = users.find(u => u.email === email)
    if (!user || user.password !== password) {
        throw new Error('Invalid email or password')
    }
    const { password: _, ...safeUser } = user
    return safeUser
}

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const dbGetTasks = (userId, { status, priority, search } = {}) => {
    let tasks = getAllTasks().filter(t => t.user_id === userId)
    if (status) tasks = tasks.filter(t => t.status === status)
    if (priority) tasks = tasks.filter(t => t.priority === priority)
    if (search) {
        const q = search.toLowerCase()
        tasks = tasks.filter(t =>
            t.title.toLowerCase().includes(q) ||
            (t.description || '').toLowerCase().includes(q)
        )
    }
    return tasks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export const dbGetStats = (userId) => {
    const tasks = getAllTasks().filter(t => t.user_id === userId)
    return {
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'todo').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        done: tasks.filter(t => t.status === 'done').length,
        high_priority: tasks.filter(t => t.priority === 'high').length,
    }
}

export const dbCreateTask = (userId, { title, description, status, priority, due_date }) => {
    const task = {
        id: nextTaskId(),
        user_id: userId,
        title,
        description: description || null,
        status: status || 'todo',
        priority: priority || 'medium',
        due_date: due_date || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
    setAllTasks([...getAllTasks(), task])
    return task
}

export const dbUpdateTask = (userId, id, fields) => {
    const tasks = getAllTasks()
    const idx = tasks.findIndex(t => t.id === id && t.user_id === userId)
    if (idx === -1) throw new Error('Task not found')
    tasks[idx] = { ...tasks[idx], ...fields, updated_at: new Date().toISOString() }
    setAllTasks(tasks)
    return tasks[idx]
}

export const dbDeleteTask = (userId, id) => {
    const tasks = getAllTasks()
    const idx = tasks.findIndex(t => t.id === id && t.user_id === userId)
    if (idx === -1) throw new Error('Task not found')
    const updated = tasks.filter(t => !(t.id === id && t.user_id === userId))
    setAllTasks(updated)
    return id
}
