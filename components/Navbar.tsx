'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface NavbarProps {
  rol?: 'presidente' | 'tesorero' | 'secretaria' | null
}

export default function Navbar({ rol }: NavbarProps) {
  const router = useRouter()
  const [menuAbierto, setMenuAbierto] = useState(false)

  async function logout() {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
    setMenuAbierto(false)
  }

  const panelHref = rol === 'tesorero' ? '/tesorero' : rol === 'presidente' ? '/presidente' : rol === 'secretaria' ? '/secretaria' : '/'
  const rolLabel = rol === 'tesorero' ? 'Tesorero' : rol === 'presidente' ? 'Presidente' : rol === 'secretaria' ? 'Secretaria' : ''
  const badgeClass = rol === 'tesorero' ? 'badge-dorado' : 'badge-azul'

  return (
    <nav style={{
      background: 'var(--azul)',
      borderBottom: '3px solid var(--dorado)',
      padding: '0 1rem',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
        <Image src="/logo-colegio.png" alt="Logo Leovigildo Kley" width={36} height={36} style={{ borderRadius: '50%', border: '2px solid var(--dorado)' }} />
        <div style={{ lineHeight: 1.15 }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'white' }}>
            Tesorería 1°B
          </p>
          <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.03em' }}>
            Esc. Leovigildo Kley
          </p>
        </div>
      </Link>

      {/* Menú escritorio */}
      <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {!rol && (
          <Link href="/login" style={btnNavStyle}>Ingresar</Link>
        )}
        {rol && (
          <>
            <Link href={panelHref} style={btnNavStyle}>Mi panel</Link>
            <span className={badgeClass}>{rolLabel}</span>
            <button onClick={logout} style={btnNavStyle}>Salir</button>
          </>
        )}
      </div>

      {/* Hamburguesa móvil */}
      <button
        className="nav-hamburger"
        onClick={() => setMenuAbierto(v => !v)}
        style={{
          background: 'none',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '0.4rem',
          padding: '0.35rem 0.5rem',
          cursor: 'pointer',
          color: 'white',
          fontSize: '1.1rem',
          lineHeight: 1,
          display: 'none',
        }}
      >
        {menuAbierto ? '✕' : '☰'}
      </button>

      {/* Menú móvil desplegable */}
      {menuAbierto && (
        <div style={{
          position: 'absolute',
          top: '60px',
          left: 0,
          right: 0,
          background: 'var(--azul-oscuro)',
          borderBottom: '3px solid var(--dorado)',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          zIndex: 99,
        }}>
          {!rol && (
            <Link href="/login" onClick={() => setMenuAbierto(false)} style={btnMenuMovil}>Ingresar</Link>
          )}
          {rol && (
            <>
              {rolLabel && <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>Sesión: {rolLabel}</span>}
              <Link href={panelHref} onClick={() => setMenuAbierto(false)} style={btnMenuMovil}>Mi panel</Link>
              <button onClick={logout} style={{ ...btnMenuMovil, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)' }}>
                Cerrar sesión
              </button>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 600px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: block !important; }
        }
      `}</style>
    </nav>
  )
}

const btnNavStyle: React.CSSProperties = {
  padding: '0.35rem 0.8rem',
  borderRadius: '0.5rem',
  border: '1px solid rgba(255,255,255,0.25)',
  background: 'rgba(255,255,255,0.08)',
  color: 'white',
  fontSize: '0.85rem',
  fontFamily: 'var(--font-body)',
  fontWeight: 500,
  cursor: 'pointer',
  textDecoration: 'none',
  transition: 'background 0.15s',
}

const btnMenuMovil: React.CSSProperties = {
  padding: '0.65rem 1rem',
  borderRadius: '0.5rem',
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.05)',
  color: 'white',
  fontSize: '0.9rem',
  fontFamily: 'var(--font-body)',
  fontWeight: 500,
  cursor: 'pointer',
  textDecoration: 'none',
  textAlign: 'left' as const,
}
