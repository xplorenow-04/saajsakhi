import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoPerson, IoBagOutline, IoHeart, IoLogOut, IoChevronForward, IoMap } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { userAuthStore } from '../../store/userStore';
import { userApi } from '../../api/user.api';
import { Button, Badge } from '../../components/ui';
import { useShopStore } from '../../store/shopStore';

export default function Profile() {
  const { user, logout } = userAuthStore();
  const navigate = useNavigate();
  const cartCount = useShopStore(s => s.getCartCount);

  const handleLogout = async () => {
    await userApi.logoutUser();
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  if (!user) return null;

  const links = [
    { label: 'My Orders', icon: IoBagOutline, path: '/profile/orders', count: null },
    { label: 'Wishlist', icon: IoHeart, path: '/wishlist', count: null },
    { label: 'Saved Addresses', icon: IoMap, path: '#', count: null },
    { label: 'Shopping Cart', icon: IoBagOutline, path: '/cart', count: cartCount() },
  ];

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-2xl border border-border bg-surface/50 mb-8"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-accent/30">
              <img
                src={user.avatar || user.avtar || 'https://via.placeholder.com/80'}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-display italic">{user.name}</h1>
              <p className="text-secondary text-sm">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={user.role === 'admin' ? 'accent' : 'default'}>{user.role}</Badge>
                {user.isVerified && <Badge variant="success">Verified</Badge>}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {links.map((link, i) => (
            <motion.div
              key={link.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={link.path}
                className="flex items-center justify-between p-5 rounded-2xl border border-border bg-surface/50 hover:bg-surface2/50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <link.icon size={20} className="text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">{link.label}</p>
                    {link.count !== null && link.count > 0 && (
                      <p className="text-xs text-muted">{link.count} items</p>
                    )}
                  </div>
                </div>
                <IoChevronForward size={18} className="text-muted group-hover:text-primary transition-all" />
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Button variant="danger" onClick={handleLogout} className="w-full">
            <IoLogOut size={18} className="mr-2" />
            Sign Out
          </Button>
        </motion.div>

        {user.role === 'admin' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-4"
          >
            <Link to="/admin/dashboard">
              <Button variant="secondary" className="w-full">
                Admin Dashboard
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
