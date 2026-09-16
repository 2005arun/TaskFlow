import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('tf_user')) } catch { return null }
    })

    const register = useCallback(async (name, email, password) => {
        const { data } = await api.post('/auth/register', { name, email, password })
        localStorage.setItem('tf_token', data.token)
        localStorage.setItem('tf_user', JSON.stringify(data.user))
        setUser(data.user)
        return data.user
    }, [])

    const login = useCallback(async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password })
        localStorage.setItem('tf_token', data.token)
        localStorage.setItem('tf_user', JSON.stringify(data.user))
        setUser(data.user)
        return data.user
    }, [])

    const loginWithGoogle = useCallback(async (credential) => {
        const { data } = await api.post('/auth/google', { credential })
        localStorage.setItem('tf_token', data.token)
        localStorage.setItem('tf_user', JSON.stringify(data.user))
        setUser(data.user)
        return data.user
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem('tf_token')
        localStorage.removeItem('tf_user')
        setUser(null)
    }, [])

    return (
        <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, register, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
