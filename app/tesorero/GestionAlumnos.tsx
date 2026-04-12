'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { type Alumno } from '@/lib/types'

interface Props {
  alumnos: Alumno[]
}

export default function GestionAlumnos({ alumnos }: Props) {
  const router = useRouter()
  const [modo, setModo] = useState<'lista' | 'agregar'>('lista')
  const [nombre, setNombre] = useState('')
  const [codigo, setCodigo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editandoCodigo, setEditandoCodigo] = useState<string | null>(null)
  const [nuevoCodigo, setNuevoCodigo] = useState('')

  function generarCodigo(nombreCompleto: string) {
    const partes = nombreCompleto.trim().split(' ')
    const apellido = partes.length >= 2 ? partes[partes.length - 1] : partes[0]
    const base = apellido.slice(0, 3).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const activos = alumnos.filter(a => a.activo)
    let candidato = `${base}-26`
    let n = 2
    while (activos.some(a => a.codigo_apoderado === candidato)) {
      candidato = `${base}${n}-26`
      n++
    }
    return candidato
  }

  async function agregarAlumno(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!nombre.trim()) { setError('Ingresa el nombre'); return }
    if (!codigo.trim()) { setError('Ingresa el código'); return }
    setLoading(true)
    const res = await fetch('/api/alumnos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nombre.trim(), codigo_apoderado: codigo.trim().toUpperCase() }),
    })
    setLoading(false)
    if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Error al agregar'); return }
    setNombre(''); setCodigo(''); setModo('lista')
    router.refresh()
  }

  async function toggleActivo(alumno: Alumno) {
    const accion = alumno.activo ? 'desactivar' : 'activar'
    if (!confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} a ${alumno.nombre}?`)) return
    await fetch(`/api/alumnos/${alumno.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: !alumno.activo }),
    })
    router.refresh()
  }

  async function guardarCodigo(id: string) {
    if (!nuevoCodigo.trim()) return
    await fetch(`/api/alumnos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo_apoderado: nuevoCodigo.trim().toUpperCase() }),
    })
    setEditandoCodigo(null)
    router.refresh()
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          onClick={() => setModo('lista')}
          className={modo === 'lista' ? 'btn-primary' : 'btn-ghost'}
          style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
        >
          Lista ({alumnos.length})
        </button>
        <button
          onClick={() => setModo('agregar')}
          className={modo === 'agregar' ? 'btn-primary' : 'btn-ghost'}
          style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
        >
          + Agregar alumno
        </button>
      </div>

      {modo === 'agregar' && (
        <form onSubmit={agregarAlumno} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--fondo)', borderRadius: '0.75rem', border: '1px solid var(--borde)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label>Nombre completo</label>
              <input
                type="text"
                value={nombre}
                onChange={e => { setNombre(e.target.value); setCodigo(generarCodigo(e.target.value)) }}
                placeholder="Ej: Sofía Reyes"
              />
            </div>
            <div>
              <label>Código apoderado</label>
              <input
                type="text"
                value={codigo}
                onChange={e => setCodigo(e.target.value.toUpperCase())}
                placeholder="REY-26"
              />
            </div>
          </div>
          {error && <p style={{ color: 'var(--rojo)', fontSize: '0.85rem', margin: '0 0 0.75rem' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Agregar'}
            </button>
            <button type="button" className="btn-ghost" onClick={() => { setModo('lista'); setError('') }}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--borde)' }}>
              {['Nombre', 'Código', 'Estado', ''].map((h, i) => (
                <th key={i} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--texto-suave)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alumnos.map((a, i) => (
              <tr key={a.id} style={{ borderBottom: '1px solid var(--borde)', background: i % 2 === 0 ? 'white' : 'var(--fondo)', opacity: a.activo ? 1 : 0.5 }}>
                <td style={{ padding: '0.6rem 0.75rem', fontWeight: 500 }}>{a.nombre}</td>
                <td style={{ padding: '0.6rem 0.75rem' }}>
                  {editandoCodigo === a.id ? (
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={nuevoCodigo}
                        onChange={e => setNuevoCodigo(e.target.value.toUpperCase())}
                        style={{ width: '100px', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                        autoFocus
                      />
                      <button onClick={() => guardarCodigo(a.id)} className="btn-primary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}>✓</button>
                      <button onClick={() => setEditandoCodigo(null)} className="btn-ghost" style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}>✕</button>
                    </div>
                  ) : (
                    <span
                      className="badge-gris"
                      style={{ cursor: 'pointer' }}
                      title="Clic para editar"
                      onClick={() => { setEditandoCodigo(a.id); setNuevoCodigo(a.codigo_apoderado) }}
                    >
                      {a.codigo_apoderado} ✎
                    </span>
                  )}
                </td>
                <td style={{ padding: '0.6rem 0.75rem' }}>
                  <span className={a.activo ? 'badge-verde' : 'badge-gris'}>
                    {a.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{ padding: '0.6rem 0.75rem' }}>
                  <button
                    onClick={() => toggleActivo(a)}
                    className="btn-ghost"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}
                  >
                    {a.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
