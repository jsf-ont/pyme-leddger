import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Loader2 } from 'lucide-react'

const AuthCallback = () => {
  const navigate = useNavigate()
  const [status, setStatus] = useState('processing')
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          setError(sessionError.message)
          setStatus('error')
          return
        }

        if (session) {
          localStorage.setItem('supabase_token', session.access_token)
          localStorage.setItem('user', JSON.stringify(session.user))
          setStatus('success')
          setTimeout(() => navigate('/dashboard'), 1000)
        } else {
          const { error: hashError } = await supabase.auth.getUser()
          
          if (hashError) {
            console.error('Hash error:', hashError)
            setError(hashError.message)
            setStatus('error')
          } else {
            setStatus('no_session')
          }
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setError(err.message)
        setStatus('error')
      }
    }

    handleAuthCallback()
  }, [navigate])

  if (status === 'processing') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        background: 'linear-gradient(135deg, #0D5C4A 0%, #1A7A62 100%)',
        color: 'white'
      }}>
        <Loader2 size={48} className="animate-spin" />
        <p style={{ fontSize: '1.1rem' }}>Verificando autenticación...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        background: '#F5F0E8',
        color: '#1A1A1A'
      }}>
        <div style={{
          padding: '24px',
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '12px',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#C44536', marginBottom: '12px' }}>Error de autenticación</h2>
          <p style={{ color: '#5C5C5C', marginBottom: '16px' }}>{error || 'Ocurrió un error al verificar tu sesión'}</p>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: '#0D5C4A',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            Volver al login
          </button>
        </div>
      </div>
    )
  }

  if (status === 'no_session') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        background: '#F5F0E8',
        color: '#1A1A1A'
      }}>
        <div style={{
          padding: '24px',
          background: 'white',
          border: '1px solid #E8E0D4',
          borderRadius: '12px',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <h2 style={{ marginBottom: '12px' }}>Sesión no encontrada</h2>
          <p style={{ color: '#5C5C5C', marginBottom: '16px' }}>Por favor inicia sesión para continuar</p>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: '#0D5C4A',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            Ir al login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      background: 'linear-gradient(135deg, #0D5C4A 0%, #1A7A62 100%)',
      color: 'white'
    }}>
      <Loader2 size={48} className="animate-spin" />
      <p style={{ fontSize: '1.1rem' }}>¡Autenticación exitosa! Redirigiendo...</p>
    </div>
  )
}

export default AuthCallback
