'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCLP, MESES_2026, type Alumno, type Movimiento } from '@/lib/types'

interface Props {
  alumnos: Alumno[]
  movimientos: Movimiento[]
  cuotaMensual: number
  pagosMap: Record<string, string[]>
}

export default function TablaAlumnosTesorero({ alumnos, movimientos, cuotaMensual, pagosMap }: Props) {
  const [expandido, setExpandido] = useState<string | null>(null)

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: '560px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--borde)' }}>
            <th style={th('left')}>Alumno</th>
            <th style={th('center')}>Pagados</th>
            <th style={th('right')}>Pagado</th>
            <th style={th('right')}>Pendiente</th>
            <th style={th('center')}>Estado</th>
            <th style={th('center')}></th>
          </tr>
        </thead>
        <tbody>
          {alumnos.map((alumno, i) => {
            const mesesPagados = pagosMap[alumno.id] ?? []
            const pagado = mesesPagados.length * cuotaMensual
            const pendiente = (MESES_2026.length - mesesPagados.length) * cuotaMensual
            const alDia = pendiente === 0
            const isOpen = expandido === alumno.id
            const movAlumno = movimientos.filter(m => m.alumno_id === alumno.id)

            return (
              <>
                <tr
                  key={alumno.id}
                  onClick={() => setExpandido(isOpen ? null : alumno.id)}
                  style={{
                    borderBottom: isOpen ? 'none' : '1px solid var(--borde)',
                    background: isOpen ? 'var(--verde-claro)' : i % 2 === 0 ? 'white' : 'var(--fondo)',
                    cursor: 'pointer',
                  }}
                >
                  <td style={{ padding: '0.7rem 0.75rem', fontWeight: 500 }}>{alumno.nombre}</td>
                  <td style={{ padding: '0.7rem 0.75rem', textAlign: 'center', color: 'var(--texto-suave)' }}>
                    {mesesPagados.length} / {MESES_2026.length}
                  </td>
                  <td style={{ padding: '0.7rem 0.75rem', textAlign: 'right', color: 'var(--verde)', fontWeight: 600 }}>
                    {formatCLP(pagado)}
                  </td>
                  <td style={{ padding: '0.7rem 0.75rem', textAlign: 'right', color: pendiente > 0 ? 'var(--rojo)' : 'var(--texto-suave)', fontWeight: 600 }}>
                    {formatCLP(pendiente)}
                  </td>
                  <td style={{ padding: '0.7rem 0.75rem', textAlign: 'center' }}>
                    <span className={alDia ? 'badge-verde' : 'badge-rojo'}>{alDia ? 'Al día' : 'Pendiente'}</span>
                  </td>
                  <td style={{ padding: '0.7rem 0.75rem', textAlign: 'center', color: 'var(--texto-suave)', fontSize: '0.8rem' }}>
                    {isOpen ? '▲' : '▼'}
                  </td>
                </tr>
                {isOpen && (
                  <tr key={`${alumno.id}-det`} style={{ borderBottom: '1px solid var(--borde)' }}>
                    <td colSpan={6} style={{ padding: '0 0.75rem 1rem', background: 'var(--verde-claro)' }}>
                      <DetalleAlumnoTesorero
                        alumno={alumno}
                        mesesPagados={mesesPagados}
                        movimientos={movAlumno}
                        cuotaMensual={cuotaMensual}
                      />
                    </td>
                  </tr>
                )}
              </>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function DetalleAlumnoTesorero({ alumno, mesesPagados, movimientos, cuotaMensual }: {
  alumno: Alumno
  mesesPagados: string[]
  movimientos: Movimiento[]
  cuotaMensual: number
}) {
  const router = useRouter()
  const pagadosSet = new Set(mesesPagados)
  const [loadingMes, setLoadingMes] = useState<string | null>(null)

  const pagosConInfo = new Map<string, { fecha: string; id: string }>()
  for (const mov of movimientos) {
    if (mov.mes_cuota && mov.monto > 0 && mov.categoria === 'Cuotas') {
      pagosConInfo.set(mov.mes_cuota, { fecha: mov.fecha, id: mov.id })
    }
  }

  async function toggleCuota(mesKey: string, estaPagado: boolean) {
    setLoadingMes(mesKey)
    if (estaPagado) {
      const info = pagosConInfo.get(mesKey)
      if (!info) { setLoadingMes(null); return }
      await fetch(`/api/movimientos/${info.id}`, { method: 'DELETE' })
    } else {
      const mesLabel = MESES_2026.find(m => m.key === mesKey)?.label ?? mesKey
      await fetch('/api/movimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha: new Date().toISOString().split('T')[0],
          categoria: 'Cuotas',
          descripcion: `Cuota ${mesLabel} 2026 — ${alumno.nombre}`,
          monto: cuotaMensual,
          alumno_id: alumno.id,
          mes_cuota: mesKey,
        }),
      })
    }
    setLoadingMes(null)
    router.refresh()
  }

  return (
    <div style={{ paddingTop: '0.75rem' }}>
      <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--verde-oscuro)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        Código: {alumno.codigo_apoderado} · Haz clic en un mes para marcar/desmarcar
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.4rem', marginBottom: '0.75rem' }}>
        {MESES_2026.map(({ key, label }) => {
          const pagado = pagadosSet.has(key)
          const cargando = loadingMes === key
          const info = pagosConInfo.get(key)
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleCuota(key, pagado)}
              disabled={cargando}
              style={{
                borderRadius: '0.4rem',
                padding: '0.4rem 0.6rem',
                background: pagado ? 'var(--verde)' : 'white',
                border: `1px solid ${pagado ? 'var(--verde)' : 'var(--borde)'}`,
                cursor: 'pointer',
                textAlign: 'left',
                opacity: cargando ? 0.5 : 1,
                transition: 'all 0.15s',
              }}
            >
              <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: pagado ? 'white' : 'var(--texto-suave)' }}>
                {cargando ? '...' : pagado ? '✓ ' : '○ '}{label}
              </p>
              {pagado && info && (
                <p style={{ margin: 0, fontSize: '0.68rem', color: 'rgba(255,255,255,0.75)' }}>
                  {new Date(info.fecha + 'T12:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                </p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function th(align: 'left' | 'right' | 'center'): React.CSSProperties {
  return {
    textAlign: align,
    padding: '0.5rem 0.75rem',
    fontSize: '0.72rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--texto-suave)',
    whiteSpace: 'nowrap',
  }
}
