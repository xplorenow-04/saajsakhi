import React, { useContext } from 'react'
import { userAuthStore } from '../../store/userStore'
import { Navigate } from 'react-router-dom'
import { authContext } from '../../context/AuthProvider'

function ProtectedRoute({ children }) {
    const { user } = userAuthStore()
    const { isLoading } = useContext(authContext)

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-900">
                <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (user.role === "admin") {
        return <Navigate to="/admin" replace />
    }

    return children
}

export default ProtectedRoute
