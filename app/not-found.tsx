import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'var(--fondo)',
      textAlign: 'center',
    }}>
      <Image
        src="/logo-colegio.png"
        alt="Logo"
        width={80}
        height={80}
        style={{ borderRadius: '50%', border: '3px solid var(--dorado)', marginBottom: '1.5rem' }}
      />
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', color: 'var(--azul)', margin: '0 0 0.25rem' }}>
        404
      </h1>
      <p style={{ fontSize: '1.1rem', color: 'var(--texto)', margin: '0 0 0.5rem', fontWeight: 600 }}>
        Página no encontrada
      </p>
      <p style={{ fontSize: '0.9rem', color: 'var(--texto-suave)', margin: '0 0 2rem', maxWidth: '320px' }}>
        La página que buscas no existe o fue movida.
      </p>
      <Link href="/" className="btn-primary">
        Volver al inicio
      </Link>
    </main>
  )
}
