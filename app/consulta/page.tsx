import Navbar from '@/components/Navbar'
import { obtenerSesion } from '@/lib/auth'
import ConsultaCliente from './ConsultaCliente'
import Link from 'next/link'

export default async function ConsultaPage() {
  const rol = await obtenerSesion()

  return (
    <>
      <Navbar rol={rol} />
      <main style={{ maxWidth: '560px', margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>

        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/" style={{ fontSize: '0.85rem', color: 'var(--texto-suave)', textDecoration: 'none' }}>
            ← Volver al inicio
          </Link>
        </div>

        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ margin: '0 0 0.25rem', fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', color: 'var(--verde)' }}>
            Consulta de estado
          </h1>
          <p style={{ margin: 0, color: 'var(--texto-suave)', fontSize: '0.9rem' }}>
            Ingresa tu código para ver el estado de cuotas de tu hijo/a.
          </p>
        </header>

        <div className="card">
          <ConsultaCliente />
        </div>

      </main>
    </>
  )
}
