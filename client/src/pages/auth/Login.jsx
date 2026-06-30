import React, { useState, useContext } from 'react'
import { userApi } from '../../api/user.api'
import { authContext } from '../../context/AuthProvider.jsx'
import { useNavigate, Link } from 'react-router-dom'
import { userAuthStore } from '../../store/userStore.js'
import { socket } from '../../socket/socket.js'
import { socketEvents } from '../../constants/socketEvents.js'
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const setUser1 = userAuthStore((s) => s.setUser)
  const authData = useContext(authContext)
  const navigate = useNavigate()

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const validate = () => {
    const { email, password } = form
    if (!email.trim() || !password.trim()) { toast.error('All fields are required'); return false }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) { toast.error('Enter a valid email address'); return false }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return false }
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
    <div className="min-h-screen bg-lux-bg flex">
      {/* Left — Brand image panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop"
          alt="Saajsakhee Collection"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-lux-text/60 via-lux-text/20 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12">
          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-3">
            Where Elegance<br />Meets Everyday
          </h2>
          <p className="text-white/70 text-sm">Discover timeless fashion crafted for the modern woman.</p>
        </div>
        {/* Brand logo overlay */}
        <div className="absolute top-10 left-10">
          <p className="font-display text-2xl font-bold tracking-[0.15em] text-white">SAAJSAKHEE</p>
          <p className="text-[9px] tracking-[0.35em] uppercase text-white/50 font-medium">Women</p>
        </div>
      </div>

      {/* Right — Form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div>
            <Link to="/" className="font-display text-xl font-bold tracking-[0.12em] text-lux-text lg:hidden block mb-8">
              SAAJSAKHEE
            </Link>
            <h1 className="font-display text-3xl font-bold text-lux-text">Welcome back</h1>
            <p className="text-lux-muted text-sm mt-2">Sign in to your account to continue</p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={login} noValidate>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-lux-text uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-lux-dim pointer-events-none" />
                <input
                  id="login-email"
                  className="luxury-input pl-10"
                  type="email"
                  placeholder="your@email.com"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-lux-text uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-lux-dim pointer-events-none" />
                <input
                  id="login-password"
                  className="luxury-input pl-10 pr-12"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-lux-dim hover:text-lux-muted transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-luxury w-full justify-center gap-2"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Signing In…' : 'Sign In'}
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>

          <p className="text-center text-sm text-lux-muted">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-lux-accent hover:text-lux-hover transition-colors">
              Create one
            </Link>
          </p>

          <div className="border-t border-lux-border pt-6 text-center">
            <Link to="/" className="text-xs text-lux-dim hover:text-lux-muted transition-colors">
              ← Back to store
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login