import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoMail, IoArrowBack } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { userApi } from '../../api/user.api';
import { Button } from '../../components/ui';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Enter your email'); return; }
    setLoading(true);
    const res = await userApi.forgotPassword?.({ email }) || { success: false, message: 'Feature coming soon' };
    setLoading(false);
    if (res.success) {
      setSent(true);
      toast.success('Check your email for reset link');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary mb-8 transition-all">
          <IoArrowBack />
          Back to login
        </Link>

        <h1 className="text-3xl font-display italic mb-2">Reset Password</h1>
        <p className="text-secondary mb-8">Enter your email and we'll send you a reset link.</p>

        {sent ? (
          <div className="p-8 rounded-2xl border border-success/30 bg-success/5 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <IoMail size={30} className="text-success" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Check Your Email</h2>
            <p className="text-secondary text-sm mb-6">We've sent a password reset link to <strong className="text-primary">{email}</strong></p>
            <Button variant="outline" onClick={() => setSent(false)}>Send Again</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">Email</label>
              <div className="relative">
                <IoMail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full bg-surface2 border border-border rounded-xl pl-12 pr-4 py-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent transition-all"
                />
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full accent-gradient text-white border-0" loading={loading}>
              Send Reset Link
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
