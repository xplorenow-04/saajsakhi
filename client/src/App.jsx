import React, { useEffect } from 'react'
import { Routes, Route } from "react-router-dom"
import Register from './pages/auth/Register.jsx'
import Login from './pages/auth/Login.jsx'
import Home from './pages/user/Home.jsx'
import { useContext } from 'react'
import { authContext } from './context/AuthProvider.jsx'
import { userApi } from './api/user.api.js'
import { userAuthStore } from './store/userStore.js'
import ProtectedRoute from './components/guards/ProtectedRoute.jsx'
import ProtectedRouteAuth from './components/guards/ProtectedRouteAuth.jsx'
import AdminRoute from './components/guards/AdminRoute.jsx'
import Chat from "./pages/user/Chat.jsx"
import GroupInfoMain from './pages/user/GroupInfoMain.jsx'
import { Toaster } from 'react-hot-toast'

import Landing from './pages/ecommerce/Landing.jsx'
import ProductListing from './pages/ecommerce/ProductListing.jsx'
import ProductDetail from './pages/ecommerce/ProductDetail.jsx'
import CartPage from './pages/ecommerce/CartPage.jsx'
import CheckoutPage from './pages/ecommerce/CheckoutPage.jsx'
import OrdersPage from './pages/ecommerce/OrdersPage.jsx'
import ProfilePage from './pages/ecommerce/ProfilePage.jsx'

import AdminLayout from './components/admin/AdminLayout.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminProducts from './pages/admin/AdminProducts.jsx'
import AdminOrders from './pages/admin/AdminOrders.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'
import AdminCategories from './pages/admin/AdminCategories.jsx'

function App() {
  const context = useContext(authContext);
  const setUser = userAuthStore().setUser
  let user;

  const authMe = async () => {
    user = await userApi.authMe();
    if (user.success) {
      context.setUser(user.data)
      setUser(user.data)
    } else {
      context.setUser(null)
      setUser(null)
    }
    context.setIsLoading(false);
  }

  useEffect(() => {
    authMe();
  }, [])

  return (
    <>
      <Toaster position="top-right" toastOptions={{
        duration: 3000,
        style: { background: '#1a1d28', color: '#f1f2f7', border: '1px solid #252840' }
      }} />
      <Routes>
        <Route path='/beep' element={<button onClick={() => {
          const audioCtx = new(window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioCtx.createOscillator();
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
          oscillator.connect(audioCtx.destination);
          setTimeout(() => oscillator.stop(), 200);
        }}>Beep</button>} />

        <Route path='/' element={<Landing />} />
        <Route path='/shop' element={<ProductListing />} />
        <Route path='/shop/:slug' element={<ProductDetail />} />
        <Route path='/cart' element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
        <Route path='/checkout' element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path='/orders' element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path='/profile' element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        <Route path='/login' element={<ProtectedRouteAuth><Login /></ProtectedRouteAuth>} />
        <Route path='/register' element={<ProtectedRouteAuth><Register /></ProtectedRouteAuth>} />
        <Route path='/home' element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path='/chat/:id' element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path='/chat/group-info/:id' element={<ProtectedRoute><GroupInfoMain /></ProtectedRoute>} />

        <Route path='/admin' element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path='products' element={<AdminProducts />} />
          <Route path='categories' element={<AdminCategories />} />
          <Route path='orders' element={<AdminOrders />} />
          <Route path='users' element={<AdminUsers />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
