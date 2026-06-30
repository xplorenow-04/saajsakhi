import React, { useState } from 'react'
import { userApi } from '../../api/user.api'
import { User, AtSign, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'

function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const validate = () => {
    const { name, username, email, password } = form
    if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) { toast.error('All fields are required'); return false }
    if (name.trim().length < 2) { toast.error('Name must be at least 2 characters'); return false }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username.trim())) { toast.error('Username must be 3–20 characters (letters, numbers, underscores)'); return false }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { toast.error('Enter a valid email address'); return false }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return false }
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

  const fields = [
    { id: 'register-name',     icon: User,   name: 'name',     type: 'text',     placeholder: 'Your full name',         autoComplete: 'name' },
    { id: 'register-username', icon: AtSign,  name: 'username', type: 'text',     placeholder: 'Choose a username',      autoComplete: 'username' },
    { id: 'register-email',    icon: Mail,    name: 'email',    type: 'email',    placeholder: 'your@email.com',         autoComplete: 'email' },
  ]

  return (
    <div className="min-h-screen bg-lux-bg flex">
      {/* Left — Brand image panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop"
          alt="Saajsakhee Collection"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-lux-text/50 via-lux-text/10 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12">
          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-3">
            Join the<br />Saajsakhee Family
          </h2>
          <p className="text-white/70 text-sm">Create your account and unlock exclusive access to curated fashion.</p>
        </div>
        <div className="absolute top-10 left-10">
          <p className="font-display text-2xl font-bold tracking-[0.15em] text-white">SAAJSAKHEE</p>
          <p className="text-[9px] tracking-[0.35em] uppercase text-white/50 font-medium">Women</p>
        </div>
      </div>

      {/* Right — Form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-7">
          <div>
            <Link to="/" className="font-display text-xl font-bold tracking-[0.12em] text-lux-text lg:hidden block mb-8">
              SAAJSAKHEE
            </Link>
            <h1 className="font-display text-3xl font-bold text-lux-text">Create account</h1>
            <p className="text-lux-muted text-sm mt-2">Join and start shopping instantly</p>
          </div>

          <form className="space-y-4" onSubmit={register} noValidate>
            {fields.map(({ id, icon: Icon, name, type, placeholder, autoComplete }) => (
              <div key={id} className="space-y-1.5">
                <label className="block text-xs font-semibold text-lux-text uppercase tracking-wider capitalize">{name}</label>
                <div className="relative">
                  <Icon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-lux-dim pointer-events-none" />
                  <input
                    id={id}
                    className="luxury-input pl-10"
                    type={type}
                    placeholder={placeholder}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    autoComplete={autoComplete}
                  />
                </div>
              </div>
            ))}

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-lux-text uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-lux-dim pointer-events-none" />
                <input
                  id="register-password"
                  className="luxury-input pl-10 pr-12"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 characters"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-lux-dim hover:text-lux-muted transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="btn-luxury w-full justify-center gap-2 mt-2"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Creating Account…' : 'Create Account'}
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>

          <p className="text-center text-sm text-lux-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-lux-accent hover:text-lux-hover transition-colors">
              Sign in
            </Link>
          </p>

          <div className="border-t border-lux-border pt-5 text-center">
            <Link to="/" className="text-xs text-lux-dim hover:text-lux-muted transition-colors">
              ← Back to store
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register