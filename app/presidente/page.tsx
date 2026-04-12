import { requiereRol, obtenerSesion } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { supabaseAdmin } from '@/lib/supabase'
import { formatCLP, MESES_2026, type Alumno, type Movimiento, type Config } from '@/lib/types'
import TablaAlumnosPresidente from './TablaAlumnosPresidente'
import ResumenImprimible from './ResumenImprimible'

export const revalidate = 0

async function getDatos() {
  const [{ data: alumnos }, { data: movimientos }, { data: configRows }] = await Promise.all([
    supabaseAdmin.from('alumnos').select('*').eq('activo', true).order('nombre'),
    supabaseAdmin.from('movimientos').select('*, alumnos(nombre)').order('fecha', { ascending: false }),
    supabaseAdmin.from('config').select('*'),
  ])
  const config: Config = {}
  for (const row of configRows ?? []) config[row.clave] = row.valor
  return {
    alumnos: (alumnos ?? []) as Alumno[],
    movimientos: (movimientos ?? []) as Movimiento[],
    config,
  }
}

export default async function PresidentePage() {
  const ok = await requiereRol('presidente')
  if (!ok) redirect('/login')
  const rol = await obtenerSesion()
  const { alumnos, movimientos, config } = await getDatos()

  const cuotaMensual = parseInt(config.cuota_mensual ?? '2000', 10)
  const totalIngresos = movimientos.filter(m => m.monto > 0).reduce((s, m) => s + m.monto, 0)
  const totalGastos = movimientos.filter(m => m.monto < 0).reduce((s, m) => s + m.monto, 0)
  const saldo = totalIngresos + totalGastos

  const pagosMap = new Map<string, Set<string>>()
  for (const alumno of alumnos) pagosMap.set(alumno.id, new Set())
  for (const mov of movimientos) {
    if (mov.alumno_id && mov.mes_cuota && mov.monto > 0 && mov.categoria === 'Cuotas') {
      pagosMap.get(mov.alumno_id)?.add(mov.mes_cuota)
    }
  }

  const totalEsperado = alumnos.length * MESES_2026.length * cuotaMensual
  const totalRecaudado = [...pagosMap.values()].reduce((s, m) => s + m.size * cuotaMensual, 0)
  const alumnosAlDia = alumnos.filter(a => pagosMap.get(a.id)?.size === MESES_2026.length).length

  const comparativaMeses = MESES_2026.map(({ key, label }) => {
    const ingresos = movimientos.filter(m => m.monto > 0 && m.fecha.startsWith(key)).reduce((s, m) => s + m.monto, 0)
    const gastos = movimientos.filter(m => m.monto < 0 && m.fecha.startsWith(key)).reduce((s, m) => s + Math.abs(m.monto), 0)
    const cuotasPagadas = [...pagosMap.values()].filter(meses => meses.has(key)).length
    return { key, label, ingresos, gastos, cuotasPagadas }
  })

  return (
    <>
      <Navbar rol={rol} />
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: '0 0 0.25rem', fontSize: 'clamp(1.4rem, 5vw, 2rem)', color: 'var(--azul)' }}>
              Panel Presidente
            </h1>
            <p style={{ margin: 0, color: 'var(--texto-suave)', fontSize: '0.9rem' }}>
              Vista de solo lectura · {alumnos.length} alumnos activos
            </p>
          </div>
          <ResumenImprimible
            alumnos={alumnos}
            saldo={saldo}
            totalIngresos={totalIngresos}
            totalGastos={totalGastos}
            totalRecaudado={totalRecaudado}
            totalEsperado={totalEsperado}
            alumnosAlDia={alumnosAlDia}
            pagosMap={Object.fromEntries([...pagosMap.entries()].map(([k, v]) => [k, [...v]]))}
            cuotaMensual={cuotaMensual}
          />
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <Tarjeta label="Saldo disponible" valor={formatCLP(saldo)} destacado />
          <Tarjeta label="Cuotas recaudadas" valor={formatCLP(totalRecaudado)} />
          <Tarjeta label="Por recaudar" valor={formatCLP(totalEsperado - totalRecaudado)} suave />
          <Tarjeta label="Alumnos al día" valor={`${alumnosAlDia} / ${alumnos.length}`} />
        </div>

        {/* Comparativa mensual */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: 'var(--azul)' }}>Comparativa mensual</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--borde)' }}>
                  {['Mes', 'Cuotas pagadas', 'Ingresos', 'Gastos', 'Balance'].map(h => (
                    <th key={h} style={{
                      padding: '0.5rem 0.75rem', textAlign: h === 'Mes' ? 'left' : 'right',
                      fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase',
                      letterSpacing: '0.05em', color: 'var(--texto-suave)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparativaMeses.map(({ key, label, ingresos, gastos, cuotasPagadas }, i) => {
                  const balance = ingresos - gastos
                  const sinActividad = ingresos === 0 && gastos === 0
                  return (
                    <tr key={key} style={{
                      borderBottom: '1px solid var(--borde)',
                      background: sinActividad ? 'var(--fondo)' : i % 2 === 0 ? 'white' : 'var(--fondo)',
                      opacity: sinActividad ? 0.5 : 1,
                    }}>
                      <td style={{ padding: '0.6rem 0.75rem', fontWeight: 500 }}>{label}</td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: 'var(--texto-suave)' }}>
                        {cuotasPagadas > 0 ? (
                          <span>{cuotasPagadas} <span style={{ fontSize: '0.75rem' }}>/ {alumnos.length}</span></span>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: ingresos > 0 ? '#16a34a' : 'var(--texto-suave)' }}>
                        {ingresos > 0 ? `+${formatCLP(ingresos)}` : '—'}
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: gastos > 0 ? 'var(--rojo)' : 'var(--texto-suave)' }}>
                        {gastos > 0 ? `-${formatCLP(gastos)}` : '—'}
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 600, color: balance > 0 ? '#16a34a' : balance < 0 ? 'var(--rojo)' : 'var(--texto-suave)' }}>
                        {sinActividad ? '—' : balance >= 0 ? `+${formatCLP(balance)}` : formatCLP(balance)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', color: 'var(--azul)' }}>Estado de cuotas por alumno</h2>
          <TablaAlumnosPresidente
            alumnos={alumnos}
            movimientos={movimientos}
            cuotaMensual={cuotaMensual}
            pagosMap={Object.fromEntries([...pagosMap.entries()].map(([k, v]) => [k, [...v]]))}
          />
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
    }}>
      <p style={{ margin: '0 0 0.3rem', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: destacado ? 'rgba(255,255,255,0.75)' : 'var(--texto-suave)' }}>
        {label}
      </p>
      <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: 700, color: destacado ? 'white' : suave ? 'var(--texto-suave)' : 'var(--texto)' }}>
        {valor}
      </p>
    </div>
  )
}
