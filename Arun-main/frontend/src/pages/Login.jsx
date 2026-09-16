import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import './Auth.css'

export default function Login() {
    const { login, loginWithGoogle } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const googleButton = useRef(null)

    useEffect(() => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
        if (!clientId || !googleButton.current || !window.google) return

        window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async ({ credential }) => {
                setLoading(true)
                try {
                    await loginWithGoogle(credential)
                    toast.success('Welcome back!')
                    navigate('/dashboard')
                } catch (err) {
                    toast.error(err.response?.data?.error || 'Google sign-in failed')
                } finally {
                    setLoading(false)
                }
            },
        })
        window.google.accounts.id.renderButton(googleButton.current, {
            theme: 'outline',
            size: 'large',
            width: 340,
            text: 'continue_with',
        })
    }, [loginWithGoogle, navigate])

    const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const submit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await login(form.email, form.password)
            toast.success('Welcome back!')
            navigate('/dashboard')
        } catch (err) {
            const message = err.response?.status === 401
                ? 'Email or password is incorrect.'
                : err.response?.data?.error || 'Unable to sign in. Please try again.'
            toast.error(message)
            setForm(current => ({ ...current, password: '' }))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card slide-up">
                {/* Logo */}
                <div className="auth-logo">
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                        <rect width="36" height="36" rx="10" fill="url(#lg1)" />
                        <path d="M10 18l5 5 11-11" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <defs>
                            <linearGradient id="lg1" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#6366f1" /><stop offset="1" stopColor="#06b6d4" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <span>TaskFlow</span>
                </div>

                <h2>Welcome back</h2>
                <p className="auth-subtitle">Sign in to manage your tasks</p>

                <form onSubmit={submit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="login-email">Email</label>
                        <input id="login-email" className="form-control" name="email" type="email"
                            placeholder="you@example.com" value={form.email} onChange={handle} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="login-password">Password</label>
                        <input id="login-password" className="form-control" name="password" type="password"
                            placeholder="••••••••" value={form.password} onChange={handle} required />
                    </div>
                    <button id="login-submit" className="btn btn-primary auth-btn" type="submit" disabled={loading}>
                        {loading ? <span className="spinner" /> : 'Sign In'}
                    </button>
                </form>

                {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                    <>
                        <div className="auth-divider"><span>or</span></div>
                        <div className="google-button" ref={googleButton} />
                    </>
                )}

                <p className="auth-footer">
                    Don't have an account?{' '}
                    <Link to="/register">Create one</Link>
                </p>
            </div>
        </div>
    )
}
