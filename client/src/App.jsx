import React, { useEffect } from 'react'
import { Routes, Route } from "react-router-dom"
import { useContext } from 'react'
import { authContext } from './context/AuthProvider.jsx'
import { userApi } from './api/user.api.js'
import { userAuthStore } from './store/userStore.js'


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
      <Routes>

        <Route path='/' element={<div></div>} />

      </Routes>
    </>
  )
}

export default App
