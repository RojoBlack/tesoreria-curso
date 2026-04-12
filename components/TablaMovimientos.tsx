'use client'
import { useState } from 'react'
import { formatCLP, CATEGORIAS, type Movimiento, type Categoria } from '@/lib/types'

interface Props {
  movimientos: Movimiento[]
}

type MovimientoAgrupado = Movimiento & { _montoTotal: number }

const POR_PAGINA = 10

function agrupar(lista: Movimiento[]): MovimientoAgrupado[] {
  const grupos = new Map<string, MovimientoAgrupado>()
  for (const m of lista) {
    const clave = `${m.fecha}|${m.descripcion}|${m.alumno_id ?? ''}|${m.categoria}`
    if (grupos.has(clave)) {
      grupos.get(clave)!._montoTotal += m.monto
    } else {
      grupos.set(clave, { ...m, _montoTotal: m.monto })
    }
  }
  return [...grupos.values()]
}

export default function TablaMovimientos({ movimientos }: Props) {
  const [filtro, setFiltro] = useState<Categoria | 'Todos'>('Todos')
  const [pagina, setPagina] = useState(1)

  const porCategoria = filtro === 'Todos' ? movimientos : movimientos.filter(m => m.categoria === filtro)
  const agrupados = agrupar(porCategoria)
  const totalPaginas = Math.max(1, Math.ceil(agrupados.length / POR_PAGINA))
  const paginados = agrupados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  function cambiarFiltro(cat: Categoria | 'Todos') {
    setFiltro(cat)
    setPagina(1)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {(['Todos', ...CATEGORIAS] as const).map(cat => (
          <button
            key={cat}
            onClick={() => cambiarFiltro(cat)}
            style={{
              padding: '0.3rem 0.75rem',
              borderRadius: '9999px',
              border: '1px solid',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
              borderColor: filtro === cat ? 'var(--azul)' : 'var(--borde)',
              background: filtro === cat ? 'var(--azul)' : 'white',
              color: filtro === cat ? 'white' : 'var(--texto-suave)',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {paginados.length === 0 ? (
        <p style={{ color: 'var(--texto-suave)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
          Sin movimientos en esta categoría
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--borde)' }}>
                {['Fecha', 'Categoría', 'Descripción', 'Monto'].map(h => (
                  <th key={h} style={{
                    textAlign: h === 'Monto' ? 'right' : 'left',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--texto-suave)',
                    whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginados.map((m, i) => (
                <tr key={m.id} style={{
                  borderBottom: '1px solid var(--borde)',
                  background: i % 2 === 0 ? 'white' : 'var(--fondo)',
                }}>
                  <td style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap', color: 'var(--texto-suave)' }}>
                    {new Date(m.fecha + 'T12:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem' }}>
                    <span className={m.categoria === 'Cuotas' ? 'badge-verde' : 'badge-gris'}>{m.categoria}</span>
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem', color: 'var(--texto)' }}>{m.descripcion}</td>
                  <td style={{
                    padding: '0.6rem 0.75rem',
                    textAlign: 'right',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    color: m._montoTotal >= 0 ? '#16a34a' : 'var(--rojo)',
                  }}>
                    {m._montoTotal >= 0 ? '+' : ''}{formatCLP(m._montoTotal)}
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
