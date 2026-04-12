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

const hoy = new Date()
const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`

function esVencido(mesKey: string) {
  return mesKey < mesActual
}

export default function TablaAlumnosTesorero({ alumnos, movimientos, cuotaMensual, pagosMap }: Props) {
  const [expandido, setExpandido] = useState<string | null>(null)
  const [soloPendientes, setSoloPendientes] = useState(false)

  const alumnosFiltrados = soloPendientes
    ? alumnos.filter(a => (pagosMap[a.id] ?? []).length < MESES_2026.length)
    : alumnos

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setSoloPendientes(v => !v)}
          style={{
            padding: '0.3rem 0.75rem', borderRadius: '9999px', border: '1px solid',
            fontSize: '0.8rem', fontFamily: 'var(--font-body)', fontWeight: 500, cursor: 'pointer',
            borderColor: soloPendientes ? 'var(--rojo)' : 'var(--borde)',
            background: soloPendientes ? 'var(--rojo-claro)' : 'white',
            color: soloPendientes ? 'var(--rojo)' : 'var(--texto-suave)',
          }}
        >
          {soloPendientes ? '✕ Mostrando con pendientes' : 'Ver solo con pendientes'}
        </button>
        <span style={{ fontSize: '0.8rem', color: 'var(--texto-suave)' }}>
          {alumnosFiltrados.length} alumno{alumnosFiltrados.length !== 1 ? 's' : ''}
        </span>
      </div>

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
            {alumnosFiltrados.map((alumno, i) => {
              const mesesPagados = pagosMap[alumno.id] ?? []
              const pagado = mesesPagados.length * cuotaMensual
              const pendiente = (MESES_2026.length - mesesPagados.length) * cuotaMensual
              const alDia = pendiente === 0
              const isOpen = expandido === alumno.id
              const movAlumno = movimientos.filter(m => m.alumno_id === alumno.id)

              const mesesVencidosSinPagar = MESES_2026.filter(
                m => !mesesPagados.includes(m.key) && esVencido(m.key)
              ).length

              return (
                <>
                  <tr
                    key={alumno.id}
                    onClick={() => setExpandido(isOpen ? null : alumno.id)}
                    style={{
                      borderBottom: isOpen ? 'none' : '1px solid var(--borde)',
                      background: isOpen ? 'var(--azul-claro)' : i % 2 === 0 ? 'white' : 'var(--fondo)',
                      cursor: 'pointer',
                    }}
                  >
                    <td style={{ padding: '0.7rem 0.75rem', fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {alumno.nombre}
                        {mesesVencidosSinPagar > 0 && (
                          <span title={`${mesesVencidosSinPagar} mes${mesesVencidosSinPagar > 1 ? 'es vencidos' : ' vencido'} sin pagar`}
                            style={{ fontSize: '0.7rem', fontWeight: 700, background: '#fff3cd', color: '#856404', border: '1px solid #ffc107', borderRadius: '9999px', padding: '0.1rem 0.4rem' }}>
                            ⚠ {mesesVencidosSinPagar}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '0.7rem 0.75rem', textAlign: 'center', color: 'var(--texto-suave)' }}>
                      {mesesPagados.length} / {MESES_2026.length}
                    </td>
                    <td style={{ padding: '0.7rem 0.75rem', textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>
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
                      <td colSpan={6} style={{ padding: '0 0.75rem 1rem', background: 'var(--azul-claro)' }}>
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
  const [loadingMeses, setLoadingMeses] = useState<Set<string>>(new Set())
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set())
  const [guardandoMultiple, setGuardandoMultiple] = useState(false)

  const pagosConInfo = new Map<string, { fecha: string; id: string }>()
  for (const mov of movimientos) {
    if (mov.mes_cuota && mov.monto > 0 && mov.categoria === 'Cuotas') {
      pagosConInfo.set(mov.mes_cuota, { fecha: mov.fecha, id: mov.id })
    }
  }

  function toggleSeleccion(mesKey: string) {
    if (pagadosSet.has(mesKey)) return
    setSeleccionados(prev => {
      const next = new Set(prev)
      if (next.has(mesKey)) next.delete(mesKey)
      else next.add(mesKey)
      return next
    })
  }

  async function toggleCuota(mesKey: string, estaPagado: boolean) {
    if (seleccionados.size > 0) { toggleSeleccion(mesKey); return }
    setLoadingMeses(prev => new Set(prev).add(mesKey))
    if (estaPagado) {
      const info = pagosConInfo.get(mesKey)
      if (info) await fetch(`/api/movimientos/${info.id}`, { method: 'DELETE' })
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
    setLoadingMeses(prev => { const n = new Set(prev); n.delete(mesKey); return n })
    router.refresh()
  }

  async function marcarSeleccionados() {
    if (seleccionados.size === 0) return
    setGuardandoMultiple(true)
    const fecha = new Date().toISOString().split('T')[0]
    await Promise.all([...seleccionados].map(mesKey => {
      const mesLabel = MESES_2026.find(m => m.key === mesKey)?.label ?? mesKey
      return fetch('/api/movimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha,
          categoria: 'Cuotas',
          descripcion: `Cuota ${mesLabel} 2026 — ${alumno.nombre}`,
          monto: cuotaMensual,
          alumno_id: alumno.id,
          mes_cuota: mesKey,
        }),
      })
    }))
    setSeleccionados(new Set())
    setGuardandoMultiple(false)
    router.refresh()
  }

  return (
    <div style={{ paddingTop: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: 'var(--azul-oscuro)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Código: {alumno.codigo_apoderado}
          {seleccionados.size === 0 && ' · Clic para marcar/desmarcar · Selecciona varios para marcar juntos'}
        </p>
        {seleccionados.size > 0 && (
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--azul)', fontWeight: 600 }}>
              {seleccionados.size} mes{seleccionados.size > 1 ? 'es' : ''} seleccionado{seleccionados.size > 1 ? 's' : ''}
            </span>
            <button onClick={marcarSeleccionados} className="btn-primary" disabled={guardandoMultiple}
              style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>
              {guardandoMultiple ? 'Marcando...' : `✓ Marcar ${seleccionados.size} como pagado${seleccionados.size > 1 ? 's' : ''}`}
            </button>
            <button onClick={() => setSeleccionados(new Set())} className="btn-ghost"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
              Cancelar
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.4rem', marginBottom: '0.75rem' }}>
        {MESES_2026.map(({ key, label }) => {
          const pagado = pagadosSet.has(key)
          const cargando = loadingMeses.has(key)
          const info = pagosConInfo.get(key)
          const vencido = esVencido(key)
          const seleccionado = seleccionados.has(key)

          let bg = 'white'
          let border = 'var(--borde)'
          let textColor = 'var(--texto-suave)'

          if (pagado) { bg = 'var(--azul)'; border = 'var(--dorado)'; textColor = 'white' }
          else if (seleccionado) { bg = 'var(--dorado-claro)'; border = 'var(--dorado)'; textColor = 'var(--dorado-oscuro)' }
          else if (vencido) { bg = '#fff3cd'; border = '#ffc107'; textColor = '#856404' }

          return (
            <button
              key={key}
              type="button"
              onClick={() => pagado ? toggleCuota(key, true) : seleccionados.size > 0 ? toggleSeleccion(key) : toggleCuota(key, false)}
              onContextMenu={e => { e.preventDefault(); if (!pagado) toggleSeleccion(key) }}
              disabled={cargando}
              title={vencido && !pagado ? 'Mes vencido sin pagar' : pagado ? 'Clic para desmarcar' : 'Clic para marcar · Clic derecho para selección múltiple'}
              style={{
                borderRadius: '0.4rem', padding: '0.4rem 0.6rem',
                background: bg, border: `2px solid ${border}`,
                cursor: 'pointer', textAlign: 'left',
                opacity: cargando ? 0.5 : 1, transition: 'all 0.12s',
              }}
            >
              <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: textColor }}>
                {cargando ? '...' : pagado ? '✓ ' : seleccionado ? '◉ ' : vencido ? '⚠ ' : '○ '}{label}
              </p>
              {pagado && info && (
                <p style={{ margin: 0, fontSize: '0.68rem', color: 'rgba(255,255,255,0.75)' }}>
                  {new Date(info.fecha + 'T12:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                </p>
              )}
              {!pagado && vencido && !seleccionado && (
                <p style={{ margin: 0, fontSize: '0.68rem', color: '#856404' }}>Vencido</p>
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
