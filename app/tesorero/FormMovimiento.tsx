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
  const [mesCuota, setMesCuota] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)

  const esCuota = categoria === 'Cuotas' && tipo === 'ingreso'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setOk(false)

    if (!descripcion.trim()) { setError('Ingresa una descripción'); return }
    if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) { setError('Ingresa un monto válido'); return }
    if (esCuota && !alumnoId) { setError('Selecciona el alumno'); return }
    if (esCuota && !mesCuota) { setError('Selecciona el mes de la cuota'); return }

    setLoading(true)
    const montoFinal = tipo === 'gasto' ? -Math.abs(Number(monto)) : Math.abs(Number(monto))

    const res = await fetch('/api/movimientos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fecha,
        categoria,
        descripcion: descripcion.trim(),
        monto: montoFinal,
        alumno_id: esCuota ? alumnoId : null,
        mes_cuota: esCuota ? mesCuota : null,
      }),
    })

    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Error al guardar')
      return
    }

    setOk(true)
    setDescripcion('')
    setMonto('')
    setAlumnoId('')
    setMesCuota('')
    router.refresh()
    setTimeout(() => setOk(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Tipo ingreso/gasto */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {(['ingreso', 'gasto'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => { setTipo(t); if (t === 'gasto') setCategoria('Materiales') }}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '0.5rem',
              border: '2px solid',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
              borderColor: tipo === t ? (t === 'ingreso' ? 'var(--verde)' : 'var(--rojo)') : 'var(--borde)',
              background: tipo === t ? (t === 'ingreso' ? 'var(--verde-claro)' : 'var(--rojo-claro)') : 'white',
              color: tipo === t ? (t === 'ingreso' ? 'var(--verde-oscuro)' : 'var(--rojo)') : 'var(--texto-suave)',
            }}
          >
            {t === 'ingreso' ? '↑ Ingreso' : '↓ Gasto'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <label>Categoría</label>
          <select value={categoria} onChange={e => setCategoria(e.target.value as Categoria)}>
            {CATEGORIAS.filter(c => tipo === 'ingreso' ? true : c !== 'Cuotas').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Fecha</label>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
        </div>
        <div>
          <label>Monto ($)</label>
          <input
            type="number"
            value={monto}
            onChange={e => setMonto(e.target.value)}
            placeholder="2000"
            min="1"
          />
        </div>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <label>Descripción</label>
        <input
          type="text"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          placeholder={esCuota ? 'Ej: Pago cuota Marzo' : 'Ej: Materiales para acto'}
        />
      </div>

      {esCuota && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <label>Alumno</label>
            <select value={alumnoId} onChange={e => setAlumnoId(e.target.value)}>
              <option value="">Seleccionar alumno...</option>
              {alumnos.map(a => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Mes de la cuota</label>
            <select value={mesCuota} onChange={e => setMesCuota(e.target.value)}>
              <option value="">Seleccionar mes...</option>
              {MESES_2026.map(m => (
                <option key={m.key} value={m.key}>{m.label} 2026</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {error && (
        <p style={{ color: 'var(--rojo)', fontSize: '0.85rem', margin: '0 0 0.75rem' }}>{error}</p>
      )}
      {ok && (
        <p style={{ color: 'var(--verde)', fontSize: '0.85rem', margin: '0 0 0.75rem', fontWeight: 600 }}>
          ✓ Movimiento registrado correctamente
        </p>
      )}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Guardando...' : 'Registrar movimiento'}
      </button>
    </form>
  )
}
