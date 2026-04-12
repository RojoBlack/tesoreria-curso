'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCLP, CATEGORIAS, type Movimiento, type Categoria } from '@/lib/types'

interface Props {
  movimientos: Movimiento[]
}

const POR_PAGINA = 10

export default function TablaMovimientosTesorero({ movimientos }: Props) {
  const router = useRouter()
  const [filtro, setFiltro] = useState<Categoria | 'Todos'>('Todos')
  const [pagina, setPagina] = useState(1)
  const [eliminando, setEliminando] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [editando, setEditando] = useState<Movimiento | null>(null)

  const porCategoria = filtro === 'Todos' ? movimientos : movimientos.filter(m => m.categoria === filtro)
  const filtrados = busqueda.trim()
    ? porCategoria.filter(m =>
        m.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.alumnos?.nombre?.toLowerCase().includes(busqueda.toLowerCase())
      )
    : porCategoria

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const paginados = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar este movimiento? Esta acción no se puede deshacer.')) return
    setEliminando(id)
    await fetch(`/api/movimientos/${id}`, { method: 'DELETE' })
    setEliminando(null)
    router.refresh()
  }

  return (
    <div>
      {editando && (
        <ModalEditar
          movimiento={editando}
          onCerrar={() => setEditando(null)}
          onGuardado={() => { setEditando(null); router.refresh() }}
        />
      )}

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {(['Todos', ...CATEGORIAS] as const).map(cat => (
          <button key={cat} onClick={() => { setFiltro(cat); setPagina(1) }} style={{
            padding: '0.3rem 0.75rem', borderRadius: '9999px', border: '1px solid',
            fontSize: '0.8rem', fontFamily: 'var(--font-body)', fontWeight: 500, cursor: 'pointer',
            transition: 'all 0.15s',
            borderColor: filtro === cat ? 'var(--azul)' : 'var(--borde)',
            background: filtro === cat ? 'var(--azul)' : 'white',
            color: filtro === cat ? 'white' : 'var(--texto-suave)',
          }}>{cat}</button>
        ))}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <input type="text" value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1) }}
          placeholder="Buscar por descripción o alumno..." style={{ fontSize: '0.875rem' }} />
      </div>

      {paginados.length === 0 ? (
        <p style={{ color: 'var(--texto-suave)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
          Sin movimientos encontrados
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--borde)' }}>
                {['Fecha', 'Categoría', 'Descripción', 'Alumno', 'Monto', ''].map((h, i) => (
                  <th key={i} style={{
                    textAlign: h === 'Monto' ? 'right' : 'left',
                    padding: '0.5rem 0.75rem', fontSize: '0.72rem', fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    color: 'var(--texto-suave)', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginados.map((m, i) => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--borde)', background: i % 2 === 0 ? 'white' : 'var(--fondo)' }}>
                  <td style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap', color: 'var(--texto-suave)' }}>
                    {new Date(m.fecha + 'T12:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem' }}>
                    <span className="badge-gris">{m.categoria}</span>
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem' }}>{m.descripcion}</td>
                  <td style={{ padding: '0.6rem 0.75rem', color: 'var(--texto-suave)', fontSize: '0.82rem' }}>
                    {m.alumnos?.nombre ?? '—'}
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap', color: m.monto >= 0 ? '#16a34a' : 'var(--rojo)' }}>
                    {m.monto >= 0 ? '+' : ''}{formatCLP(m.monto)}
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                      <button onClick={() => setEditando(m)} title="Editar"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--azul)', fontSize: '0.9rem', padding: '0.2rem 0.3rem' }}>
                        ✎
                      </button>
                      <button onClick={() => eliminar(m.id)} disabled={eliminando === m.id} title="Eliminar"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texto-suave)', fontSize: '0.9rem', padding: '0.2rem 0.3rem' }}>
                        {eliminando === m.id ? '...' : '🗑'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPaginas > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1} className="btn-ghost" style={{ padding: '0.3rem 0.75rem', fontSize: '0.85rem' }}>←</button>
          <span style={{ fontSize: '0.85rem', color: 'var(--texto-suave)' }}>{pagina} / {totalPaginas}</span>
          <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas} className="btn-ghost" style={{ padding: '0.3rem 0.75rem', fontSize: '0.85rem' }}>→</button>
        </div>
      )}
    </div>
  )
}

function ModalEditar({ movimiento: m, onCerrar, onGuardado }: {
  movimiento: Movimiento
  onCerrar: () => void
  onGuardado: () => void
}) {
  const esGasto = m.monto < 0
  const [fecha, setFecha] = useState(m.fecha)
  const [descripcion, setDescripcion] = useState(m.descripcion)
  const [categoria, setCategoria] = useState<Categoria>(m.categoria)
  const [monto, setMonto] = useState(String(Math.abs(m.monto)))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    if (!descripcion.trim()) { setError('Ingresa una descripción'); return }
    if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) { setError('Monto inválido'); return }
    setLoading(true)
    const montoFinal = esGasto ? -Math.abs(Number(monto)) : Math.abs(Number(monto))
    const res = await fetch(`/api/movimientos/${m.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fecha, descripcion: descripcion.trim(), categoria, monto: montoFinal }),
    })
    setLoading(false)
    if (!res.ok) { setError('Error al guardar'); return }
    onGuardado()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, padding: '1rem',
    }} onClick={onCerrar}>
      <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '1.5rem' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--azul)' }}>Editar movimiento</h3>
          <button onClick={onCerrar} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--texto-suave)' }}>✕</button>
        </div>
        <form onSubmit={guardar}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label>Fecha</label>
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
            </div>
            <div>
              <label>Monto ($)</label>
              <input type="number" value={monto} onChange={e => setMonto(e.target.value)} min="1" />
            </div>
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label>Categoría</label>
            <select value={categoria} onChange={e => setCategoria(e.target.value as Categoria)}>
              {CATEGORIAS.filter(c => esGasto ? c !== 'Cuotas' : true).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Descripción</label>
            <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
          </div>
          {error && <p style={{ color: 'var(--rojo)', fontSize: '0.85rem', margin: '0 0 0.75rem' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button type="button" className="btn-ghost" onClick={onCerrar}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
