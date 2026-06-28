import React, { useState, useContext } from 'react'
import { userApi } from '../../api/user.api'
import { authContext } from '../../context/AuthProvider.jsx'
import { useNavigate } from 'react-router-dom'
import { userAuthStore } from '../../store/userStore.js'
import { socket } from '../../socket/socket.js'
import { socketEvents } from '../../constants/socketEvents.js'
import { Zap, Mail, Lock, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

function Login() {
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const setUser1 = userAuthStore((s) => s.setUser)
    const authData = useContext(authContext)
    const navigate = useNavigate()

    const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

    const validate = () => {
        const { email, password } = form
        if (!email.trim() || !password.trim()) {
            toast.error('All fields are required')
            return false
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email.trim())) {
            toast.error('Enter a valid email address')
            return false
        }
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return false
        }
        return true
    }

    const login = async (e) => {
        e.preventDefault()
        if (!validate()) return
        setLoading(true)
        try {
            const response = await userApi.loginUser({ email: form.email.trim(), password: form.password })
            if (response.success) {
                authData.login(response.data)
                setUser1(response.data)
                socket.emit(socketEvents.USER_LOGGED_IN)
                toast.success(`Welcome back, ${response.data.name}!`)
                navigate(response.data?.role === 'admin' ? '/admin' : '/home')
            } else {
                toast.error(response.message || 'Invalid credentials')
            }
        } catch {
            toast.error('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full bg-surface-900 flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute -top-[10%] left-[30%] w-[500px] h-[500px] rounded-full pointer-events-none bg-accent/10 blur-[80px]" />
            <div className="absolute -bottom-[10%] right-[20%] w-[400px] h-[400px] rounded-full pointer-events-none bg-violet/10 blur-[80px]" />

            <div className="relative w-full max-w-md bg-surface-800 border border-white/[0.06] rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
                />

                <div className="flex flex-col items-center pt-12 pb-8 px-8 relative z-10">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl mb-5 shadow-lg animate-float"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 24px rgba(99,102,241,0.5)' }}>
                        <Zap size={24} color="#fff" />
                    </div>
                    <h1 className="text-2xl font-bold text-text-primary tracking-tight">Welcome back</h1>
                    <p className="text-sm text-text-dim mt-2">Sign in to continue</p>
                </div>

                <div className="h-px bg-white/[0.06] mx-8" />

                <form className="flex flex-col gap-4 px-8 pt-8 pb-10 relative z-10" onSubmit={login} noValidate>
                    <div className="relative group">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none transition-colors group-focus-within:text-accent-light" />
                        <input
                            id="login-email"
                            className="w-full bg-surface-700 border border-white/[0.06] rounded-xl py-3.5 pl-11 pr-4 text-text-primary text-sm outline-none transition-all duration-200 placeholder:text-text-dim focus:border-accent/50 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
                            type="email"
                            placeholder="Enter your email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
                        />
                    </div>

                    <div className="relative group">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none transition-colors group-focus-within:text-accent-light" />
                        <input
                            id="login-password"
                            className="w-full bg-surface-700 border border-white/[0.06] rounded-xl py-3.5 pl-11 pr-4 text-text-primary text-sm outline-none transition-all duration-200 placeholder:text-text-dim focus:border-accent/50 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
                            type="password"
                            placeholder="Enter your password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        id="login-submit"
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 mt-2 rounded-xl text-white text-sm font-semibold tracking-wide cursor-pointer transition-all duration-200 hover:shadow-[0_8px_24px_rgba(99,102,241,0.45)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {loading ? 'Signing In…' : 'Sign In'}
                    </button>

                    <p className="text-center text-xs text-text-dim mt-2">
                        Don't have an account?{' '}
                        <a href="/register" className="text-accent-light hover:text-violet-light transition-colors duration-150 font-medium">
                            Create one
                        </a>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default Login