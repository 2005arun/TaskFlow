import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import './Navbar.css'

export default function Navbar({ onNewTask }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        toast.success('Logged out')
        navigate('/login')
    }

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
        : '?'

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                    <rect width="36" height="36" rx="10" fill="url(#navLg)" />
                    <path d="M10 18l5 5 11-11" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <defs>
                        <linearGradient id="navLg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#6366f1" /><stop offset="1" stopColor="#06b6d4" />
                        </linearGradient>
                    </defs>
                </svg>
                <span>TaskFlow</span>
            </div>

            <div className="navbar-actions">
                <button id="new-task-btn" className="btn btn-primary" onClick={onNewTask}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    New Task
                </button>

                <div className="navbar-user">
                    <div className="avatar">{initials}</div>
                    <div className="user-info">
                        <span className="user-name">{user?.name}</span>
                        <span className="user-email">{user?.email}</span>
                    </div>
                </div>

                <button id="logout-btn" className="btn-icon" onClick={handleLogout} title="Logout">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                </button>
            </div>
        </nav>
    )
}
