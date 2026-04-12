'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORIAS, MESES_2026, type Alumno, type Categoria } from '@/lib/types'

interface Props {
  alumnos: Alumno[]
}

export default function FormMovimiento({ alumnos }: Props) {
  const router = useRouter()
  const [tipo, setTipo] = useState<'ingreso' | 'gasto'>('ingreso')
  const [categoria, setCategoria] = useState<Categoria>('Cuotas')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [alumnoId, setAlumnoId] = useState('')
  const [mesesSeleccionados, setMesesSeleccionados] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)

  const esCuota = categoria === 'Cuotas' && tipo === 'ingreso'
  const cuotaMensual = 2000

  function toggleMes(key: string) {
    setMesesSeleccionados(prev =>
      prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key]
    )
  }

  function resetForm() {
    setDescripcion('')
    setMonto('')
    setAlumnoId('')
    setMesesSeleccionados([])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setOk(false)

    if (esCuota) {
      if (!alumnoId) { setError('Selecciona el alumno'); return }
      if (mesesSeleccionados.length === 0) { setError('Selecciona al menos un mes'); return }
    } else {
      if (!descripcion.trim()) { setError('Ingresa una descripción'); return }
      if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) { setError('Ingresa un monto válido'); return }
    }

    setLoading(true)

    if (esCuota) {
      const alumno = alumnos.find(a => a.id === alumnoId)
      const mesesOrdenados = [...mesesSeleccionados].sort()
      const labels = mesesOrdenados.map(k => MESES_2026.find(m => m.key === k)?.label ?? k)

      await Promise.all(mesesOrdenados.map(mesKey => {
        const mesLabel = MESES_2026.find(m => m.key === mesKey)?.label ?? mesKey
        return fetch('/api/movimientos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fecha,
            categoria: 'Cuotas',
            descripcion: mesesOrdenados.length === 1
              ? `Cuota ${mesLabel} 2026 — ${alumno?.nombre}`
              : `Cuotas ${labels.join(', ')} 2026 — ${alumno?.nombre}`,
            monto: cuotaMensual,
            alumno_id: alumnoId,
            mes_cuota: mesKey,
          }),
        })
      }))
    } else {
      const montoFinal = tipo === 'gasto' ? -Math.abs(Number(monto)) : Math.abs(Number(monto))
      const res = await fetch('/api/movimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha, categoria,
          descripcion: descripcion.trim(),
          monto: montoFinal,
          alumno_id: alumnoId || null,
          mes_cuota: null,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        setLoading(false)
        setError(d.error ?? 'Error al guardar')
        return
      }
    }

    setLoading(false)
    setOk(true)
    resetForm()
    router.refresh()
    setTimeout(() => setOk(false), 4000)
  }

  const montoCalculado = esCuota ? mesesSeleccionados.length * cuotaMensual : null

  return (
    <form onSubmit={handleSubmit}>
      {/* Tipo ingreso/gasto */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {(['ingreso', 'gasto'] as const).map(t => (
          <button key={t} type="button"
            onClick={() => { setTipo(t); if (t === 'gasto') setCategoria('Materiales'); setMesesSeleccionados([]) }}
            style={{
              flex: 1, padding: '0.5rem', borderRadius: '0.5rem', border: '2px solid',
              fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
              transition: 'all 0.15s',
              borderColor: tipo === t ? (t === 'ingreso' ? '#16a34a' : 'var(--rojo)') : 'var(--borde)',
              background: tipo === t ? (t === 'ingreso' ? '#dcfce7' : 'var(--rojo-claro)') : 'white',
              color: tipo === t ? (t === 'ingreso' ? '#14532d' : 'var(--rojo)') : 'var(--texto-suave)',
            }}>
            {t === 'ingreso' ? '↑ Ingreso' : '↓ Gasto'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <label>Categoría</label>
          <select value={categoria} onChange={e => { setCategoria(e.target.value as Categoria); setMesesSeleccionados([]) }}>
            {CATEGORIAS.filter(c => tipo === 'ingreso' ? true : c !== 'Cuotas').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Fecha de pago</label>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
        </div>
        {!esCuota && (
          <div>
            <label>Monto ($)</label>
            <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="2000" min="1" />
          </div>
        )}
        {esCuota && montoCalculado !== null && montoCalculado > 0 && (
          <div>
            <label>Monto total</label>
            <div style={{
              padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
              border: '1px solid #bbf7d0', background: '#f0fdf4',
              fontSize: '1rem', fontWeight: 700, color: '#14532d',
            }}>
              ${montoCalculado.toLocaleString('es-CL')}
            </div>
          </div>
        )}
      </div>

      {!esCuota && (
        <div style={{ marginBottom: '0.75rem' }}>
          <label>Descripción</label>
          <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)}
            placeholder="Ej: Materiales para acto" />
        </div>
      )}

      {/* Alumno (opcional para no-cuotas, obligatorio para cuotas) */}
      {tipo === 'ingreso' && (
        <div style={{ marginBottom: '0.75rem' }}>
          <label>Alumno {esCuota ? '' : '(opcional)'}</label>
          <select value={alumnoId} onChange={e => setAlumnoId(e.target.value)}>
            <option value="">Sin alumno asociado</option>
            {alumnos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
        </div>
      )}

      {/* Selección múltiple de meses para cuotas */}
      {esCuota && (
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label style={{ margin: 0 }}>
              Meses a pagar
              {mesesSeleccionados.length > 0 && (
                <span style={{ marginLeft: '0.5rem', color: '#16a34a', fontWeight: 700, fontSize: '0.85rem', textTransform: 'none', letterSpacing: 0 }}>
                  · {mesesSeleccionados.length} seleccionado{mesesSeleccionados.length > 1 ? 's' : ''}
                </span>
              )}
            </label>
            {mesesSeleccionados.length > 0 && (
              <button type="button" onClick={() => setMesesSeleccionados([])}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--texto-suave)' }}>
                Limpiar
              </button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.4rem' }}>
            {MESES_2026.map(({ key, label }) => {
              const sel = mesesSeleccionados.includes(key)
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleMes(key)}
                  style={{
                    padding: '0.4rem 0.5rem',
                    borderRadius: '0.4rem',
                    border: `2px solid ${sel ? 'var(--azul)' : 'var(--borde)'}`,
                    background: sel ? 'var(--azul)' : 'white',
                    color: sel ? 'white' : 'var(--texto-suave)',
                    fontSize: '0.82rem',
                    fontFamily: 'var(--font-body)',
                    fontWeight: sel ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.12s',
                    textAlign: 'center',
                  }}
                >
                  {sel ? '✓ ' : ''}{label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {error && <p style={{ color: 'var(--rojo)', fontSize: '0.85rem', margin: '0 0 0.75rem' }}>{error}</p>}
      {ok && (
        <p style={{ color: '#16a34a', fontSize: '0.85rem', margin: '0 0 0.75rem', fontWeight: 600 }}>
          ✓ {esCuota && mesesSeleccionados.length > 1
            ? `${mesesSeleccionados.length} cuotas registradas correctamente`
            : 'Movimiento registrado correctamente'}
        </p>
      )}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Guardando...' : esCuota && mesesSeleccionados.length > 1
          ? `Registrar ${mesesSeleccionados.length} cuotas ($${(mesesSeleccionados.length * cuotaMensual).toLocaleString('es-CL')})`
          : 'Registrar movimiento'}
      </button>
    </form>
  )
}
