import { useEffect } from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { userAuthStore } from './store/userStore';
import { userApi } from './api/user.api';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/user/Home';
import Shop from './pages/user/Shop';
import ProductDetail from './pages/user/ProductDetail';
import Cart from './pages/user/Cart';
import Wishlist from './pages/user/Wishlist';
import Profile from './pages/user/Profile';
import OrderHistory from './pages/user/OrderHistory';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import AdminDashboard from './pages/admin/AdminDashboard';

// Guards
import ProtectedRoute from './components/guards/ProtectedRoute';
import ProtectedRouteAuth from './components/guards/ProtectedRouteAuth';
import AdminRoute from './components/guards/AdminRoute';

// Old chat pages (standalone, manage own layout)
import Chat from './pages/user/Chat';
import ChatHome from './pages/user/ChatHome';
import GroupInfoMain from './pages/user/GroupInfoMain';
import Portfolio from './pages/user/Portfolio';

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeInOut' },
};

function AnimatedPage({ children }) {
  return (
    <motion.div {...pageTransition}>
      {children}
    </motion.div>
  );
}

function MainLayout() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

function App() {
  const setUser = userAuthStore(s => s.setUser);
  const location = useLocation();

  useEffect(() => {
    const authMe = async () => {
      const res = await userApi.authMe();
      if (res?.success) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    };
    authMe();
  }, []);

  return (
    <ThemeProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'hsl(var(--surface))',
            color: 'hsl(var(--primary))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '12px',
          },
        }}
      />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Auth Pages (no layout) */}
          <Route path="/login" element={<ProtectedRouteAuth><AnimatedPage><Login /></AnimatedPage></ProtectedRouteAuth>} />
          <Route path="/register" element={<ProtectedRouteAuth><AnimatedPage><Register /></AnimatedPage></ProtectedRouteAuth>} />
          <Route path="/forgot-password" element={<AnimatedPage><ForgotPassword /></AnimatedPage>} />

          {/* Main Layout with Navbar+Footer */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
            <Route path="/shop" element={<AnimatedPage><Shop /></AnimatedPage>} />
            <Route path="/product/:id" element={<AnimatedPage><ProductDetail /></AnimatedPage>} />

            <Route path="/cart" element={<ProtectedRoute><AnimatedPage><Cart /></AnimatedPage></ProtectedRoute>} />
            <Route path="/wishlist" element={<AnimatedPage><Wishlist /></AnimatedPage>} />
            <Route path="/profile" element={<ProtectedRoute><AnimatedPage><Profile /></AnimatedPage></ProtectedRoute>} />
            <Route path="/profile/orders" element={<ProtectedRoute><AnimatedPage><OrderHistory /></AnimatedPage></ProtectedRoute>} />

            <Route path="/admin/dashboard" element={<AdminRoute><AnimatedPage><AdminDashboard /></AnimatedPage></AdminRoute>} />
          </Route>

          {/* Chat pages (standalone - they have their own layout) */}
          <Route path="/chats" element={<ProtectedRoute><ChatHome /></ProtectedRoute>} />
          <Route path="/chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/chat/group-info/:id" element={<ProtectedRoute><GroupInfoMain /></ProtectedRoute>} />

          {/* Portfolio - public */}
          <Route path="/portfolio" element={<Portfolio />} />
        </Routes>
      </AnimatePresence>
    </ThemeProvider>
  );
}

export default App;
