import { createContext, useContext, useState, useCallback } from 'react'
import { dbRegister, dbLogin } from '../services/localDB'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('tf_user')) } catch { return null }
    })

    const register = useCallback(async (name, email, password) => {
        const safeUser = dbRegister(name, email, password)
        localStorage.setItem('tf_user', JSON.stringify(safeUser))
        setUser(safeUser)
        return safeUser
    }, [])

    const login = useCallback(async (email, password) => {
        const safeUser = dbLogin(email, password)
        localStorage.setItem('tf_user', JSON.stringify(safeUser))
        setUser(safeUser)
        return safeUser
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem('tf_user')
        setUser(null)
    }, [])

    return (
        <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
