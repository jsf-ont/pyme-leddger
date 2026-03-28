import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AuthCallback from './components/AuthCallback'
import './styles/app.css'
import { supabase, isSupabaseConfigured } from './lib/supabase'

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token') || localStorage.getItem('supabase_token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token') || localStorage.getItem('supabase_token')
  if (token) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

function App() {
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      if (isSupabaseConfigured()) {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            localStorage.setItem('supabase_token', session.access_token)
            localStorage.setItem('token', session.access_token)
            localStorage.setItem('user', JSON.stringify(session.user))
          }

          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
              localStorage.setItem('supabase_token', session.access_token)
              localStorage.setItem('token', session.access_token)
              localStorage.setItem('user', JSON.stringify(session.user))
            } else {
              localStorage.removeItem('supabase_token')
              localStorage.removeItem('token')
              localStorage.removeItem('user')
            }
          })

          return () => subscription.unsubscribe()
        } catch (err) {
          console.error('Supabase auth init error:', err)
        }
      }
      setInitializing(false)
    }

    initAuth()
  }, [])

  if (initializing) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0D5C4A 0%, #1A7A62 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '1.1rem' }}>Cargando...</div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        <Route 
          path="/demo" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/auth/callback" 
          element={<AuthCallback />}
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
