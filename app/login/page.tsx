'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error ?? 'Error al ingresar')
      return
    }
    if (data.rol === 'tesorero')    router.push('/tesorero')
    if (data.rol === 'presidente')  router.push('/presidente')
    if (data.rol === 'secretaria')  router.push('/secretaria')
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div className="card" style={{ width: '100%', maxWidth: '380px' }}>
          <h2 style={{ marginTop: 0, marginBottom: '0.25rem', fontSize: '1.5rem', color: 'var(--azul)' }}>
            Acceso restringido
          </h2>
          <p style={{ color: 'var(--texto-suave)', marginTop: 0, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Ingresa tu contraseña para acceder a tu panel.
          </p>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoFocus
              />
            </div>
            {error && (
              <p style={{ color: 'var(--rojo)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>
            )}
            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </main>
    </>
  )
}
