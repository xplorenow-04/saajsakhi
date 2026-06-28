import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoPerson, IoAt, IoMail, IoLockClosed, IoEyeOff, IoEye } from 'react-icons/io5';
import { userApi } from '../../api/user.api';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.username || !form.email || !form.password) {
      toast.error('Please fill all fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const res = await userApi.registerUser(form);
    setLoading(false);
    if (res.success) {
      toast.success('Account created! Please login.');
      navigate('/login');
    } else {
      toast.error(res.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Image */}
      <div className="hidden lg:block flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=85"
          alt="Fashion"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-12 right-12 z-20 text-right">
          <p className="text-white/60 text-sm uppercase tracking-widest mb-2">Join the</p>
          <p className="text-white text-3xl font-display italic">Community</p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="mb-10">
            <Link to="/" className="text-2xl font-display italic font-bold">
              SAAJ<span className="accent-gradient-text">SAKHI</span>
            </Link>
            <h1 className="text-3xl font-display italic mt-8 mb-2">Create Account</h1>
            <p className="text-secondary">Join SAAJSAKHI today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Name</label>
              <div className="relative">
                <IoPerson size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full bg-surface2 border border-border rounded-xl pl-12 pr-4 py-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Username</label>
              <div className="relative">
                <IoAt size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  className="w-full bg-surface2 border border-border rounded-xl pl-12 pr-4 py-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Email</label>
              <div className="relative">
                <IoMail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Your email address"
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
                  placeholder="Create a password"
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

            <Button type="submit" size="lg" className="w-full accent-gradient text-white border-0" loading={loading}>
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-secondary mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-accent font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
