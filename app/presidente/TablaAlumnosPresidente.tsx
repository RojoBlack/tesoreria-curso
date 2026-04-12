'use client'
import { useState } from 'react'
import { formatCLP, MESES_2026, type Alumno, type Movimiento } from '@/lib/types'

interface Props {
  alumnos: Alumno[]
  movimientos: Movimiento[]
  cuotaMensual: number
  pagosMap: Record<string, string[]>
}

export default function TablaAlumnosPresidente({ alumnos, movimientos, cuotaMensual, pagosMap }: Props) {
  const [expandido, setExpandido] = useState<string | null>(null)

  function toggleExpandir(id: string) {
    setExpandido(prev => prev === id ? null : id)
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: '600px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--borde)' }}>
            <th style={thStyle('left')}>Alumno</th>
            <th style={thStyle('center')}>Meses pagados</th>
            <th style={thStyle('right')}>Pagado</th>
            <th style={thStyle('right')}>Pendiente</th>
            <th style={thStyle('center')}>Estado</th>
            <th style={thStyle('center')}></th>
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
                  style={{
                    borderBottom: isOpen ? 'none' : '1px solid var(--borde)',
                    background: isOpen ? 'var(--verde-claro)' : i % 2 === 0 ? 'white' : 'var(--fondo)',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onClick={() => toggleExpandir(alumno.id)}
                >
                  <td style={{ padding: '0.7rem 0.75rem', fontWeight: 500 }}>
                    {alumno.nombre}
                  </td>
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
                    <span className={alDia ? 'badge-verde' : 'badge-rojo'}>
                      {alDia ? 'Al día' : 'Pendiente'}
                    </span>
                  </td>
                  <td style={{ padding: '0.7rem 0.75rem', textAlign: 'center', color: 'var(--texto-suave)', fontSize: '0.8rem' }}>
                    {isOpen ? '▲' : '▼'}
                  </td>
                </tr>
                {isOpen && (
                  <tr key={`${alumno.id}-detalle`} style={{ borderBottom: '1px solid var(--borde)' }}>
                    <td colSpan={6} style={{ padding: '0 0.75rem 1rem', background: 'var(--verde-claro)' }}>
                      <DetalleAlumno
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

function DetalleAlumno({ alumno, mesesPagados, movimientos, cuotaMensual }: {
  alumno: Alumno
  mesesPagados: string[]
  movimientos: Movimiento[]
  cuotaMensual: number
}) {
  const pagadosSet = new Set(mesesPagados)

  const pagosConFecha = new Map<string, string>()
  for (const mov of movimientos) {
    if (mov.mes_cuota && mov.monto > 0) pagosConFecha.set(mov.mes_cuota, mov.fecha)
  }

  return (
    <div style={{ paddingTop: '0.75rem' }}>
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--verde-oscuro)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Código apoderado: {alumno.codigo_apoderado}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.4rem', marginBottom: '1rem' }}>
        {MESES_2026.map(({ key, label }) => {
          const pagado = pagadosSet.has(key)
          const fecha = pagosConFecha.get(key)
          return (
            <div key={key} style={{
              borderRadius: '0.4rem',
              padding: '0.4rem 0.6rem',
              background: pagado ? 'white' : 'rgba(255,255,255,0.5)',
              border: `1px solid ${pagado ? '#bbf7d0' : 'var(--borde)'}`,
            }}>
              <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: pagado ? 'var(--verde-oscuro)' : 'var(--texto-suave)' }}>
                {pagado ? '✓ ' : '○ '}{label}
              </p>
              {pagado && fecha && (
                <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--texto-suave)' }}>
                  {new Date(fecha + 'T12:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {movimientos.length > 0 && (
        <>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--verde-oscuro)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Historial de movimientos
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #bbf7d0' }}>
                <th style={thStyle('left')}>Fecha</th>
                <th style={thStyle('left')}>Descripción</th>
                <th style={thStyle('right')}>Monto</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid rgba(187,247,208,0.5)' }}>
                  <td style={{ padding: '0.4rem 0.5rem', color: 'var(--texto-suave)', whiteSpace: 'nowrap' }}>
                    {new Date(m.fecha + 'T12:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                  </td>
                  <td style={{ padding: '0.4rem 0.5rem' }}>{m.descripcion}</td>
                  <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right', fontWeight: 600, color: m.monto >= 0 ? 'var(--verde)' : 'var(--rojo)' }}>
                    {m.monto >= 0 ? '+' : ''}{formatCLP(m.monto)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

function thStyle(align: 'left' | 'right' | 'center'): React.CSSProperties {
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
