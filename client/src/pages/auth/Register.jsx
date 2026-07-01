import React, { useState } from 'react'
import { userApi } from '../../api/user.api'
import { Zap, User, AtSign, Mail, Lock, Loader2 } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'

function Register() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', username: '', email: '', password: '' })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

    const validate = () => {
        const { name, username, email, password } = form
        if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) {
            toast.error('All fields are required')
            return false
        }
        if (name.trim().length < 2) {
            toast.error('Name must be at least 2 characters')
            return false
        }
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(username.trim())) {
            toast.error('Username must be 3–20 characters and can only contain letters, numbers, and underscores')
            return false
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            toast.error('Enter a valid email address')
            return false
        }
        if (password.length < 8) {
            toast.error('Password must be at least 8 characters')
            return false
        }
        return true
    }

    const register = async (e) => {
        e.preventDefault()
        if (!validate()) return
        setLoading(true)
        try {
            const response = await userApi.registerUser({
                name: form.name.trim(),
                username: form.username.trim().toLowerCase(),
                email: form.email.trim().toLowerCase(),
                password: form.password
            })
            if (response.success) {
                toast.success('Account created! Please sign in.')
                navigate('/login')
            } else {
                toast.error(response.message || 'Registration failed. Please try again.')
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

                <div className="flex flex-col items-center pt-10 pb-6 px-8 relative z-10">
                    <div className="w-20 h-20 rounded-full border border-gold-500/20 shadow-lg shadow-gold-500/5 mb-4 animate-float overflow-hidden bg-black flex items-center justify-center">
                        <img src="/logo_emblem.png" alt="SaajSakhee Logo" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-2xl font-bold text-text-primary tracking-tight">Create an account</h1>
                    <p className="text-sm text-text-dim mt-2">Join and start shopping instantly</p>
                </div>

                <div className="h-px bg-white/[0.06] mx-8" />

                <form className="flex flex-col gap-4 px-8 pt-8 pb-10 relative z-10" onSubmit={register} noValidate>
                    <div className="relative group">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none transition-colors group-focus-within:text-accent-light" />
                        <input
                            id="register-name"
                            className="w-full bg-surface-700 border border-white/[0.06] rounded-xl py-3.5 pl-11 pr-4 text-text-primary text-sm outline-none transition-all duration-200 placeholder:text-text-dim focus:border-accent/50 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)]"
                            type="text"
                            placeholder="Enter your full name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            autoComplete="name"
                        />
                    </div>

                    <div className="relative group">
                        <AtSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none transition-colors group-focus-within:text-accent-light" />
                        <input
                            id="register-username"
                            className="w-full bg-surface-700 border border-white/[0.06] rounded-xl py-3.5 pl-11 pr-4 text-text-primary text-sm outline-none transition-all duration-200 placeholder:text-text-dim focus:border-accent/50 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)]"
                            type="text"
                            placeholder="Choose a username"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            autoComplete="username"
                        />
                    </div>

                    <div className="relative group">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none transition-colors group-focus-within:text-accent-light" />
                        <input
                            id="register-email"
                            className="w-full bg-surface-700 border border-white/[0.06] rounded-xl py-3.5 pl-11 pr-4 text-text-primary text-sm outline-none transition-all duration-200 placeholder:text-text-dim focus:border-accent/50 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)]"
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
                            id="register-password"
                            className="w-full bg-surface-700 border border-white/[0.06] rounded-xl py-3.5 pl-11 pr-4 text-text-primary text-sm outline-none transition-all duration-200 placeholder:text-text-dim focus:border-accent/50 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)]"
                            type="password"
                            placeholder="Create a password (min 8 chars)"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        id="register-submit"
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 mt-2 rounded-xl text-neutral-950 text-sm font-semibold tracking-wide cursor-pointer transition-all duration-200 bg-gradient-to-r from-gold-200 via-gold-500 to-gold-600 hover:shadow-[0_8px_24px_rgba(212,175,55,0.35)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
                        style={{ boxShadow: '0 4px 16px rgba(212,175,55,0.2)' }}
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {loading ? 'Creating Account…' : 'Create Account'}
                    </button>

                    <p className="text-center text-xs text-text-dim mt-2">
                        Already have an account?{' '}
                        <Link to="/login" className="text-accent-light hover:text-violet-light transition-colors duration-150 font-medium">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default Register