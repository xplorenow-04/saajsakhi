import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { userAuthStore } from '../../store/userStore'
import { authContext } from '../../context/AuthProvider'

/**
 * AdminRoute – wraps admin-only pages.
 *  - While session is loading → show spinner
 *  - Not logged in → redirect to /admin/login
 *  - Logged in but NOT admin → redirect to / (access denied)
 *  - Logged in AND admin → render children
 */
function AdminRoute({ children }) {
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
        return <Navigate to="/admin/login" replace />
    }

    if (user.role !== 'admin') {
        return <Navigate to="/" replace />
    }

    return children
}

export default AdminRoute
