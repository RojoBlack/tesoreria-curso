'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { type Alumno, type Donacion } from '@/lib/types'

interface Props {
  alumnos: Alumno[]
  donaciones: Donacion[]
}

export default function GestionDonaciones({ alumnos, donaciones }: Props) {
  const router = useRouter()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [convivencia, setConvivencia] = useState('')
  const [alumnoId, setAlumnoId] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editando, setEditando] = useState<Donacion | null>(null)

  // Agrupar por convivencia
  const porConvivencia = donaciones.reduce((acc, d) => {
    if (!acc[d.convivencia]) acc[d.convivencia] = []
    acc[d.convivencia].push(d)
    return acc
  }, {} as Record<string, Donacion[]>)

  // Convivencias únicas para el datalist
  const convivenciasExistentes = [...new Set(donaciones.map(d => d.convivencia))]

  function resetForm() {
    setConvivencia('')
    setAlumnoId('')
    setDescripcion('')
    setFecha(new Date().toISOString().split('T')[0])
    setError('')
    setEditando(null)
    setMostrarForm(false)
  }

  function iniciarEdicion(d: Donacion) {
    setEditando(d)
    setConvivencia(d.convivencia)
    setAlumnoId(d.alumno_id)
    setDescripcion(d.descripcion)
    setFecha(d.fecha)
    setMostrarForm(true)
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!convivencia.trim()) { setError('Ingresa el nombre de la convivencia'); return }
    if (!alumnoId) { setError('Selecciona un alumno'); return }
    if (!descripcion.trim()) { setError('Ingresa qué donó'); return }

    setLoading(true)
    const body = {
      convivencia: convivencia.trim(),
      alumno_id: alumnoId,
      descripcion: descripcion.trim(),
      fecha,
    }

    const res = editando
      ? await fetch(`/api/donaciones/${editando.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      : await fetch('/api/donaciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

    setLoading(false)
    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? 'Error al guardar')
      return
    }
    resetForm()
    router.refresh()
  }

  async function eliminar(d: Donacion) {
    if (!confirm(`¿Eliminar la donación de ${d.alumnos?.nombre ?? 'este alumno'}?`)) return
    await fetch(`/api/donaciones/${d.id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div>
      {/* Botón agregar */}
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => { setMostrarForm(!mostrarForm); if (editando) resetForm() }}
          className={mostrarForm && !editando ? 'btn-ghost' : 'btn-primary'}
          style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
        >
          {mostrarForm && !editando ? 'Cancelar' : '+ Registrar donación'}
        </button>
      </div>

      {/* Formulario */}
      {mostrarForm && (
        <form onSubmit={guardar} style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          background: 'var(--fondo)',
          borderRadius: '0.75rem',
          border: '1px solid var(--borde)',
        }}>
          <p style={{ margin: '0 0 0.875rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--azul)' }}>
            {editando ? 'Editar donación' : 'Nueva donación'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label>Convivencia</label>
              <input
                type="text"
                value={convivencia}
                onChange={e => setConvivencia(e.target.value)}
                placeholder="Ej: Día del Alumno"
                list="convivencias-list"
              />
              <datalist id="convivencias-list">
                {convivenciasExistentes.map(c => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label>Alumno</label>
              <select value={alumnoId} onChange={e => setAlumnoId(e.target.value)}>
                <option value="">Seleccionar...</option>
                {alumnos.map(a => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label>¿Qué donó?</label>
              <input
                type="text"
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                placeholder="Ej: jugo y galletas"
              />
            </div>

            <div>
              <label>Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p style={{ color: 'var(--rojo)', fontSize: '0.85rem', margin: '0 0 0.75rem' }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : editando ? 'Guardar cambios' : 'Registrar'}
            </button>
            <button type="button" className="btn-ghost" onClick={resetForm}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista de donaciones */}
      {Object.keys(porConvivencia).length === 0 ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--texto-suave)', textAlign: 'center', padding: '1.5rem 0' }}>
          No hay donaciones registradas aún.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {Object.entries(porConvivencia).map(([conv, lista]) => (
            <div key={conv}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                <span style={{
                  background: 'var(--dorado)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  padding: '0.2rem 0.75rem',
                  borderRadius: '999px',
                }}>
                  {conv}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--texto-suave)' }}>
                  {lista.length} {lista.length === 1 ? 'aporte' : 'aportes'}
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--borde)' }}>
                      {['Alumno', 'Donó', 'Fecha', ''].map((h, i) => (
                        <th key={i} style={{
                          textAlign: 'left', padding: '0.4rem 0.75rem',
                          fontSize: '0.7rem', fontWeight: 600,
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                          color: 'var(--texto-suave)',
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lista.map((d, i) => (
                      <tr key={d.id} style={{
                        borderBottom: '1px solid var(--borde)',
                        background: i % 2 === 0 ? 'white' : 'var(--fondo)',
                      }}>
                        <td style={{ padding: '0.55rem 0.75rem', fontWeight: 500 }}>
                          {d.alumnos?.nombre ?? '—'}
                        </td>
                        <td style={{ padding: '0.55rem 0.75rem', color: 'var(--texto)' }}>
                          🎁 {d.descripcion}
                        </td>
                        <td style={{ padding: '0.55rem 0.75rem', color: 'var(--texto-suave)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                          {new Date(d.fecha + 'T12:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '0.55rem 0.75rem' }}>
                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            <button
                              onClick={() => iniciarEdicion(d)}
                              className="btn-ghost"
                              style={{ padding: '0.2rem 0.55rem', fontSize: '0.78rem' }}
                            >
                              ✎
                            </button>
                            <button
                              onClick={() => eliminar(d)}
                              className="btn-ghost"
                              style={{ padding: '0.2rem 0.55rem', fontSize: '0.78rem', color: 'var(--rojo)', borderColor: 'var(--rojo)' }}
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
