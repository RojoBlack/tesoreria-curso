import { requiereRol, obtenerSesion } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { supabaseAdmin } from '@/lib/supabase'
import { formatCLP, MESES_2026, type Alumno, type Movimiento, type Config, type Donacion } from '@/lib/types'
import FormMovimiento from './FormMovimiento'
import GestionAlumnos from './GestionAlumnos'
import TablaAlumnosTesorero from './TablaAlumnosTesorero'
import TablaMovimientosTesorero from './TablaMovimientosTesorero'
import GestionDonaciones from './GestionDonaciones'

export const revalidate = 0

async function getDatos() {
  const [{ data: alumnos }, { data: movimientos }, { data: configRows }, { data: donaciones }] = await Promise.all([
    supabaseAdmin.from('alumnos').select('*').order('nombre'),
    supabaseAdmin.from('movimientos').select('*, alumnos(nombre)').order('fecha', { ascending: false }),
    supabaseAdmin.from('config').select('*'),
    supabaseAdmin.from('donaciones').select('*, alumnos(nombre)').order('convivencia').order('created_at', { ascending: true }),
  ])
  const config: Config = {}
  for (const row of configRows ?? []) config[row.clave] = row.valor
  return {
    alumnos: (alumnos ?? []) as Alumno[],
    movimientos: (movimientos ?? []) as Movimiento[],
    config,
    donaciones: (donaciones ?? []) as Donacion[],
  }
}

export default async function TesoreroPage() {
  const ok = await requiereRol('tesorero')
  if (!ok) redirect('/login')
  const rol = await obtenerSesion()
  const { alumnos, movimientos, config, donaciones } = await getDatos()

  const alumnosActivos = alumnos.filter(a => a.activo)
  const cuotaMensual = parseInt(config.cuota_mensual ?? '2000', 10)
  const totalIngresos = movimientos.filter(m => m.monto > 0).reduce((s, m) => s + m.monto, 0)
  const totalGastos = movimientos.filter(m => m.monto < 0).reduce((s, m) => s + m.monto, 0)
  const saldo = totalIngresos + totalGastos

  const pagosMap = new Map<string, Set<string>>()
  const saldoAFavorMap = new Map<string, number>()
  for (const a of alumnosActivos) {
    pagosMap.set(a.id, new Set())
    saldoAFavorMap.set(a.id, 0)
  }
  for (const mov of movimientos) {
    if (mov.alumno_id && mov.monto > 0 && mov.categoria === 'Cuotas') {
      if (mov.mes_cuota) {
        pagosMap.get(mov.alumno_id)?.add(mov.mes_cuota)
      } else {
        saldoAFavorMap.set(mov.alumno_id, (saldoAFavorMap.get(mov.alumno_id) ?? 0) + mov.monto)
      }
    }
  }

  const totalEsperado = alumnosActivos.length * MESES_2026.length * cuotaMensual
  const totalRecaudado = [...pagosMap.values()].reduce((s, m) => s + m.size * cuotaMensual, 0)
    + [...saldoAFavorMap.values()].reduce((s, v) => s + v, 0)
  const alumnosAlDia = alumnosActivos.filter(a => {
    const meses = pagosMap.get(a.id)?.size ?? 0
    const saldo = saldoAFavorMap.get(a.id) ?? 0
    return Math.max(0, (MESES_2026.length - meses) * cuotaMensual - saldo) === 0
  }).length

  return (
    <>
      <Navbar rol={rol} />
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ margin: '0 0 0.25rem', fontSize: 'clamp(1.4rem, 5vw, 2rem)', color: 'var(--azul)' }}>
            Panel Tesorero
          </h1>
          <p style={{ margin: 0, color: 'var(--texto-suave)', fontSize: '0.9rem' }}>
            Acceso completo · {alumnosActivos.length} alumnos activos
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <Tarjeta label="Saldo disponible" valor={formatCLP(saldo)} destacado />
          <Tarjeta label="Total ingresos" valor={formatCLP(totalIngresos)} />
          <Tarjeta label="Total gastos" valor={formatCLP(Math.abs(totalGastos))} suave />
          <Tarjeta label="Cuotas recaudadas" valor={formatCLP(totalRecaudado)} />
          <Tarjeta label="Por recaudar" valor={formatCLP(totalEsperado - totalRecaudado)} suave />
          <Tarjeta label="Alumnos al día" valor={`${alumnosAlDia} / ${alumnosActivos.length}`} />
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: 'var(--azul)' }}>Registrar movimiento</h2>
          <FormMovimiento alumnos={alumnosActivos} />
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', color: 'var(--azul)' }}>Estado de cuotas por alumno</h2>
          <TablaAlumnosTesorero
            alumnos={alumnosActivos}
            movimientos={movimientos}
            cuotaMensual={cuotaMensual}
            pagosMap={Object.fromEntries([...pagosMap.entries()].map(([k, v]) => [k, [...v]]))}
            saldoAFavorMap={Object.fromEntries(saldoAFavorMap)}
          />
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: 'var(--azul)' }}>Todos los movimientos</h2>
          <TablaMovimientosTesorero movimientos={movimientos} />
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem', color: 'var(--azul)' }}>🎉 Donaciones para convivencias</h2>
          <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: 'var(--texto-suave)' }}>
            Registra qué trajo cada apoderado para las actividades del curso.
          </p>
          <GestionDonaciones alumnos={alumnosActivos} donaciones={donaciones} />
        </div>

        <div className="card">
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: 'var(--azul)' }}>Gestión de alumnos</h2>
          <GestionAlumnos alumnos={alumnos} />
        </div>
      </main>
    </>
  )
}

function Tarjeta({ label, valor, destacado, suave }: {
  label: string; valor: string; destacado?: boolean; suave?: boolean
}) {
  return (
    <div className="card" style={{
      background: destacado ? 'var(--azul)' : 'white',
      border: destacado ? '2px solid var(--dorado)' : '1px solid var(--borde)',
      padding: '1rem',
    }}>
      <p style={{ margin: '0 0 0.3rem', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: destacado ? 'rgba(255,255,255,0.7)' : 'var(--texto-suave)' }}>
        {label}
      </p>
      <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 700, color: destacado ? 'white' : suave ? 'var(--texto-suave)' : 'var(--texto)' }}>
        {valor}
      </p>
    </div>
  )
}