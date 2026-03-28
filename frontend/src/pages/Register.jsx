import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, ArrowRight, ArrowLeft } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const Register = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    ruc: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [supabaseReady, setSupabaseReady] = useState(false)

  useEffect(() => {
    setSupabaseReady(isSupabaseConfigured())
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Por favor completa todos los campos')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return false
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return false
    }
    setError('')
    return true
  }

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2)
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (supabaseReady) {
      try {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              company_name: formData.companyName,
              ruc: formData.ruc
            }
          }
        })

        if (signUpError) throw signUpError

        if (data.session) {
          localStorage.setItem('supabase_token', data.session.access_token)
          localStorage.setItem('token', data.session.access_token)
          localStorage.setItem('user', JSON.stringify(data.user))
          navigate('/dashboard')
        } else {
          setError('Por favor verifica tu correo electrónico para activar tu cuenta')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    } else {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
        
        const res = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            companyName: formData.companyName,
            ruc: formData.ruc
          })
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Error al registrar')
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

        .btn-ghost {
          background: transparent;
          color: #5C5C5C;
          border: none;
          padding: 14px 24px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: inherit;
        }

        .btn-ghost:hover {
          color: #0D5C4A;
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

        .step-indicator {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
        }

        .step-dot {
          flex: 1;
          height: 4px;
          border-radius: 2px;
          background: #E8E0D4;
          transition: background 0.3s;
        }

        .step-dot.active {
          background: #0D5C4A;
        }

        .step-back {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: #5C5C5C;
          font-size: 0.9rem;
          cursor: pointer;
          padding: 8px 0;
          margin-bottom: 16px;
          font-family: inherit;
        }

        .step-back:hover {
          color: #0D5C4A;
        }

        .optional-tag {
          font-size: 0.75rem;
          color: #8C8C8C;
          font-weight: 400;
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
        <h1>Empieza hoy<br/>sin costo</h1>
        <p>
          Únete a miles de emprendedores que ya están llevando 
          su contabilidad correctamente.
        </p>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Crear cuenta</h2>
            <p>
              {step === 1 
                ? 'Ingresa tus datos personales' 
                : 'Configura tu empresa'}
            </p>
          </div>

          <div className="step-indicator">
            <div className={`step-dot ${step >= 1 ? 'active' : ''}`}></div>
            <div className={`step-dot ${step >= 2 ? 'active' : ''}`}></div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          {step === 1 ? (
            <div className="auth-form">
              <div className="form-group">
                <label>Nombre completo</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Juan Pérez"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Contraseña</label>
                <div className="password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
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

              <div className="form-group">
                <label>Confirmar contraseña</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="button" className="btn-primary" onClick={handleNext}>
                Continuar <ArrowRight size={20} />
              </button>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <button type="button" className="step-back" onClick={() => setStep(1)}>
                <ArrowLeft size={16} /> Volver
              </button>

              <div className="form-group">
                <label>Nombre de tu empresa</label>
                <input
                  type="text"
                  name="companyName"
                  placeholder="Mi Bodega SAC"
                  value={formData.companyName}
                  onChange={handleChange}
                />
                <span className="optional-tag">Opcional - puedes agregarlo después</span>
              </div>

              <div className="form-group">
                <label>RUC</label>
                <input
                  type="text"
                  name="ruc"
                  placeholder="20123456789"
                  value={formData.ruc}
                  onChange={handleChange}
                  maxLength={11}
                />
                <span className="optional-tag">Opcional</span>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Crear Cuenta'}
              </button>
            </form>
          )}

          <p className="auth-footer">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
