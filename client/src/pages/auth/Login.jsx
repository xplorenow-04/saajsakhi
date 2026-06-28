import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoMail, IoLockClosed, IoEyeOff, IoEye } from 'react-icons/io5';
import { userApi } from '../../api/user.api';
import { userAuthStore } from '../../store/userStore';
import { socket } from '../../socket/socket';
import { socketEvents } from '../../constants/socketEvents';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui';

export default function Login() {
  const navigate = useNavigate();
  const setUser = userAuthStore(s => s.setUser);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    const res = await userApi.loginUser(form);
    setLoading(false);
    if (res.success) {
      setUser(res.data);
      socket.emit(socketEvents.USER_LOGGED_IN);
      toast.success('Welcome back!');
      navigate(res.data.role === 'admin' ? '/admin/dashboard' : '/');
    } else {
      toast.error(res.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="mb-10">
            <Link to="/" className="text-2xl font-display italic font-bold">
              SAAJ<span className="accent-gradient-text">SAKHI</span>
            </Link>
            <h1 className="text-3xl font-display italic mt-8 mb-2">Welcome Back</h1>
            <p className="text-secondary">Sign in to continue shopping</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Email</label>
              <div className="relative">
                <IoMail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full bg-surface2 border border-border rounded-xl pl-12 pr-4 py-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Password</label>
              <div className="relative">
                <IoLockClosed size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full bg-surface2 border border-border rounded-xl pl-12 pr-12 py-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-all"
                >
                  {showPassword ? <IoEyeOff size={18} /> : <IoEye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-accent hover:underline">
                Forgot Password?
              </Link>
            </div>

            <Button type="submit" size="lg" className="w-full accent-gradient text-white border-0" loading={loading}>
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-secondary mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent font-medium hover:underline">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right - Image */}
      <div className="hidden lg:block flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-l from-black/50 to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&q=85"
          alt="Fashion"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-12 left-12 z-20">
          <p className="text-white/60 text-sm uppercase tracking-widest mb-2">Welcome to</p>
          <p className="text-white text-3xl font-display italic">SAAJSAKHI</p>
        </div>
      </div>
    </div>
  );
}
