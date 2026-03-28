import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Calculator } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [supabaseReady, setSupabaseReady] = useState(false)

  useEffect(() => {
    setSupabaseReady(isSupabaseConfigured())
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (supabaseReady) {
      try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (signInError) throw signInError

        localStorage.setItem('supabase_token', data.session.access_token)
        localStorage.setItem('token', data.session.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        navigate('/dashboard')
      } catch (err) {
        setError(err.message === 'Invalid login credentials' 
          ? 'Credenciales inválidas' 
          : err.message)
      } finally {
        setLoading(false)
      }
    } else {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
        
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Error al iniciar sesión')
        }

        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('company', JSON.stringify(data.company))
        
        navigate('/dashboard')
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleDemo = async () => {
    setLoading(true)
    setError('')

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      
      const res = await fetch(`${API_URL}/api/auth/demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar demo')
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('company', JSON.stringify(data.company))
      localStorage.setItem('demo_mode', 'true')
      
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (resetError) throw resetError
      setResetSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          background: linear-gradient(135deg, #0D5C4A 0%, #1A7A62 100%);
        }

        .auth-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px;
          color: white;
        }

        .auth-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F5F0E8;
          padding: 40px;
        }

        .auth-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 60px;
        }

        .auth-logo-icon {
          width: 48px;
          height: 48px;
          background: #D4A853;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.5rem;
          color: #0D5C4A;
        }

        .auth-logo-text {
          font-family: 'Syne', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .auth-left h1 {
          font-family: 'Syne', sans-serif;
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 20px;
          line-height: 1.1;
        }

        .auth-left p {
          font-size: 1.15rem;
          opacity: 0.9;
          max-width: 400px;
          line-height: 1.7;
        }

        .auth-form-container {
          width: 100%;
          max-width: 420px;
        }

        .auth-form-header {
          margin-bottom: 32px;
        }

        .auth-form-header h2 {
          font-family: 'Syne', sans-serif;
          font-size: 1.75rem;
          color: #1A1A1A;
          margin-bottom: 8px;
        }

        .auth-form-header p {
          color: #5C5C5C;
          font-size: 0.95rem;
        }

        .auth-form-header a {
          color: #0D5C4A;
          text-decoration: none;
          font-weight: 600;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1A1A1A;
        }

        .form-group input {
          padding: 14px 16px;
          border: 2px solid #E8E0D4;
          border-radius: 10px;
          font-size: 1rem;
          font-family: inherit;
          transition: border-color 0.2s;
          background: white;
        }

        .form-group input:focus {
          outline: none;
          border-color: #0D5C4A;
        }

        .form-group input::placeholder {
          color: #8C8C8C;
        }

        .password-input {
          position: relative;
        }

        .password-input input {
          width: 100%;
          padding-right: 48px;
        }

        .password-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #8C8C8C;
          padding: 4px;
        }

        .password-toggle:hover {
          color: #0D5C4A;
        }

        .auth-error {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          color: #C44536;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .btn-primary {
          background: #0D5C4A;
          color: white;
          border: none;
          padding: 14px 24px;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: inherit;
        }

        .btn-primary:hover:not(:disabled) {
          background: #094539;
          transform: translateY(-1px);
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: white;
          color: #0D5C4A;
          border: 2px solid #0D5C4A;
          padding: 14px 24px;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: inherit;
        }

        .btn-secondary:hover:not(:disabled) {
          background: rgba(13, 92, 74, 0.05);
        }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 24px 0;
        }

        .auth-divider::before,
        .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #E8E0D4;
        }

        .auth-divider span {
          font-size: 0.85rem;
          color: #8C8C8C;
        }

        .auth-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 0.9rem;
          color: #5C5C5C;
        }

        .auth-footer a {
          color: #0D5C4A;
          text-decoration: none;
          font-weight: 600;
        }

        @media (max-width: 900px) {
          .auth-left {
            display: none;
          }
          
          .auth-right {
            flex: none;
            width: 100%;
          }
        }
      `}</style>

      <div className="auth-left">
        <Link to="/" className="auth-logo">
          <div className="auth-logo-icon">₿</div>
          <span className="auth-logo-text">BeanPCGE</span>
        </Link>
        <h1>Contabilidad<br/>sin complicaciones</h1>
        <p>
          La herramienta que todo emprendedor peruano necesita. 
          100% compatible con el PCGE y listo para SUNAT.
        </p>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Bienvenido de nuevo</h2>
            <p>Ingresa a tu cuenta para continuar</p>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {resetSent && (
            <div style={{
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#047857',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              marginBottom: '16px'
            }}>
              Se ha enviado un enlace de recuperación a tu correo electrónico
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!showReset}
                  disabled={showReset}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {showReset ? (
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Enviar enlace de recuperación'}
              </button>
            ) : (
              <>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <Loader2 size={20} className="animate-spin" /> : 'Iniciar Sesión'}
                </button>
                {supabaseReady && (
                  <button
                    type="button"
                    onClick={() => setShowReset(!showReset)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0D5C4A',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      textAlign: 'center',
                      marginTop: '8px'
                    }}
                  >
                    {showReset ? 'Volver a iniciar sesión' : 'Olvidé mi contraseña'}
                  </button>
                )}
              </>
            )}
          </form>

          <div className="auth-divider">
            <span>o</span>
          </div>

          <button 
            className="btn-secondary" 
            onClick={handleDemo}
            disabled={loading}
          >
            <Calculator size={20} />
            Probar Demo Gratis
          </button>

          <p className="auth-footer">
            ¿No tienes cuenta? <Link to="/register">Regístrate gratis</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
