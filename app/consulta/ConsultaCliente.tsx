'use client'
import { useState } from 'react'
import { formatCLP, MESES_2026 } from '@/lib/types'

interface EstadoCuota {
  mes: string
  label: string
  pagado: boolean
  fecha?: string
  parcial: number
}

interface ResultadoConsulta {
  nombre: string
  cuotaMensual: number
  totalPagado: number
  totalPendiente: number
  mesesPagados: number
  cuotas: EstadoCuota[]
}

export default function ConsultaCliente() {
  const [codigo, setCodigo] = useState('')
  const [resultado, setResultado] = useState<ResultadoConsulta | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function buscar(e: React.FormEvent) {
    e.preventDefault()
    if (!codigo.trim()) return
    setLoading(true)
    setError('')
    setResultado(null)

    const res = await fetch(`/api/consulta?codigo=${encodeURIComponent(codigo.trim().toUpperCase())}`)
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'No se encontró el código ingresado.')
      return
    }
    setResultado(data)
  }

  function limpiar() {
    setCodigo('')
    setResultado(null)
    setError('')
  }

  return (
    <div>
      {!resultado ? (
        <form onSubmit={buscar}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Código de apoderado</label>
            <input
              type="text"
              value={codigo}
              onChange={e => setCodigo(e.target.value)}
              onInput={e => {
                const input = e.currentTarget
                input.value = input.value.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                setCodigo(input.value)
              }}
              placeholder="Ej: ELAHALARCON"
              autoFocus
              style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}
            />
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', color: 'var(--texto-suave)' }}>
              El código fue entregado por el tesorero del curso.
            </p>
          </div>
          {error && (
            <div style={{
              background: 'var(--rojo-claro)',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              color: 'var(--rojo)',
            }}>
              {error}
            </div>
          )}
          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Buscando...' : 'Consultar estado'}
          </button>
        </form>
      ) : (
        <ResultadoView resultado={resultado} onVolver={limpiar} />
      )}
    </div>
  )
}

function ResultadoView({ resultado, onVolver }: { resultado: ResultadoConsulta; onVolver: () => void }) {
  const { nombre, cuotaMensual, totalPagado, totalPendiente, mesesPagados, cuotas } = resultado
  const todoAlDia = totalPendiente === 0

  return (
    <div>
      <div style={{
        background: todoAlDia ? 'var(--azul-claro)' : '#fff7ed',
        border: `1px solid ${todoAlDia ? '#b8c8e8' : '#fed7aa'}`,
        borderRadius: '0.75rem',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <span style={{ fontSize: '1.5rem' }}>{todoAlDia ? '✅' : '⚠️'}</span>
        <div>
          <p style={{ margin: '0 0 0.1rem', fontWeight: 700, fontSize: '1rem', color: 'var(--texto)' }}>
            {nombre}
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem', color: todoAlDia ? 'var(--azul-oscuro)' : '#92400e' }}>
            {todoAlDia
              ? 'Al día con todas las cuotas pagadas'
              : `${mesesPagados} de 10 meses pagados · ${formatCLP(totalPendiente)} pendiente`}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--texto-suave)' }}>
            Pagado
          </p>
          <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--azul)' }}>
            {formatCLP(totalPagado)}
          </p>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--texto-suave)' }}>
            Pendiente
          </p>
          <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: totalPendiente > 0 ? 'var(--rojo)' : 'var(--texto-suave)' }}>
            {formatCLP(totalPendiente)}
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <p style={{ margin: '0 0 1rem', fontWeight: 600, fontSize: '0.9rem' }}>
          Estado por mes · Cuota {formatCLP(cuotaMensual)}/mes
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem' }}>
          {cuotas.map(c => {
            const pct = c.parcial > 0 ? Math.round((c.parcial / cuotaMensual) * 100) : 0

            if (c.parcial > 0) {
              // Mes con abono parcial: mitad azul / mitad gris
              return (
                <div key={c.mes} style={{
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  border: '2px solid var(--dorado)',
                  position: 'relative',
                  minHeight: '62px',
                }}>
                  {/* Fondo dividido */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(to right, var(--azul) ${pct}%, var(--fondo) ${pct}%)`,
                  }} />
                  {/* Contenido */}
                  <div style={{
                    position: 'relative', zIndex: 1,
                    padding: '0.6rem 0.75rem',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}>
                    <span style={{ fontSize: '1rem', color: 'var(--dorado)' }}>◑</span>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--texto)' }}>
                        {c.label}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--dorado-oscuro)', fontWeight: 600 }}>
                        Abonado {formatCLP(c.parcial)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <div key={c.mes} style={{
                borderRadius: '0.5rem',
                padding: '0.6rem 0.75rem',
                background: c.pagado ? 'var(--azul)' : 'var(--fondo)',
                border: `2px solid ${c.pagado ? 'var(--dorado)' : 'var(--borde)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: '1rem', color: c.pagado ? 'var(--dorado)' : 'var(--texto-suave)' }}>
                  {c.pagado ? '✓' : '○'}
                </span>
                <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: c.pagado ? 'white' : 'var(--texto)' }}>
                    {c.label}
                  </p>
                  {c.pagado && c.fecha && (
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>
                      {new Date(c.fecha + 'T12:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                    </p>
                  )}
                  {!c.pagado && (
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--texto-suave)' }}>
                      Pendiente
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <button onClick={onVolver} className="btn-ghost" style={{ width: '100%' }}>
        ← Consultar otro alumno
      </button>
    </div>
  )
}