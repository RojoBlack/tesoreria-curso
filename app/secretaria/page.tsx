import { requiereRol, obtenerSesion } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { supabaseAdmin } from '@/lib/supabase'
import type { Reunion, Decision, Aviso } from '@/lib/types-secretaria'
import type { Config } from '@/lib/types'
import SecretariaCliente from './SecretariaCliente'

export const revalidate = 0

async function getDatos() {
  const [
    { data: reuniones },
    { data: decisiones },
    { data: avisos },
    { data: configRows },
  ] = await Promise.all([
    supabaseAdmin
      .from('reuniones')
      .select('*, actas(*), decisiones(*)')
      .order('fecha', { ascending: false }),
    supabaseAdmin
      .from('decisiones')
      .select('*')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('avisos')
      .select('*')
      .order('created_at', { ascending: false }),
    supabaseAdmin.from('config').select('*'),
  ])

  const config: Config = {}
  for (const row of configRows ?? []) config[row.clave] = row.valor

  return {
    reuniones: (reuniones ?? []) as Reunion[],
    decisiones: (decisiones ?? []) as Decision[],
    avisos: (avisos ?? []) as Aviso[],
    config,
  }
}

export default async function SecretariaPage() {
  const ok = await requiereRol('secretaria')
  if (!ok) redirect('/login')
  const rol = await obtenerSesion()
  const { reuniones, decisiones, avisos, config } = await getDatos()

  return (
    <>
      <Navbar rol={rol} />
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ margin: '0 0 0.25rem', fontSize: 'clamp(1.4rem, 5vw, 2rem)', color: 'var(--azul)' }}>
            Panel Secretaria
          </h1>
          <p style={{ margin: 0, color: 'var(--texto-suave)', fontSize: '0.9rem' }}>
            Gestión de reuniones, actas, decisiones y avisos · 1°B 2026
          </p>
        </header>
        <SecretariaCliente
          reuniones={reuniones}
          decisiones={decisiones}
          avisos={avisos}
          proximaReunion={config.proxima_reunion ?? ''}
        />
      </main>
    </>
  )
}
