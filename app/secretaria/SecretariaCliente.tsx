'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { REUNION_TIPOS, DECISION_ESTADOS, type Reunion, type Decision, type Aviso, type DecisionEstado } from '@/lib/types-secretaria'

interface Props {
  reuniones: Reunion[]
  decisiones: Decision[]
  avisos: Aviso[]
  proximaReunion: string
}

type Vista = 'resumen' | 'reuniones' | 'decisiones' | 'avisos'

export default function SecretariaCliente({ reuniones, decisiones, avisos, proximaReunion }: Props) {
  const [vista, setVista] = useState<Vista>('resumen')

  const pendientes = decisiones.filter(d => d.estado === 'Pendiente').length
  const enProceso = decisiones.filter(d => d.estado === 'En proceso').length

  return (
    <div>
      {/* Tarjetas resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <Tarjeta label="Reuniones" valor={String(reuniones.length)} />
        <Tarjeta label="Decisiones pendientes" valor={String(pendientes)} alerta={pendientes > 0} />
        <Tarjeta label="En proceso" valor={String(enProceso)} />
        <Tarjeta label="Avisos activos" valor={String(avisos.length)} destacado />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem', borderBottom: '2px solid var(--borde)', paddingBottom: '0.75rem' }}>
        {([
          { key: 'resumen', label: '📋 Resumen' },
          { key: 'reuniones', label: '🗓 Reuniones' },
          { key: 'decisiones', label: '✅ Decisiones' },
          { key: 'avisos', label: '📢 Avisos' },
        ] as { key: Vista; label: string }[]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setVista(tab.key)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: vista === tab.key ? 'var(--azul)' : 'var(--fondo)',
              color: vista === tab.key ? 'white' : 'var(--texto-suave)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {vista === 'resumen'   && <VistaResumen reuniones={reuniones} decisiones={decisiones} proximaReunion={proximaReunion} />}
      {vista === 'reuniones' && <VistaReuniones reuniones={reuniones} />}
      {vista === 'decisiones' && <VistaDecisiones decisiones={decisiones} reuniones={reuniones} />}
      {vista === 'avisos'    && <VistaAvisos avisos={avisos} />}
    </div>
  )
}

/* ─── RESUMEN ─────────────────────────────────────────────── */
function VistaResumen({ reuniones, decisiones, proximaReunion }: { reuniones: Reunion[]; decisiones: Decision[]; proximaReunion: string }) {
  const router = useRouter()
  const [proxima, setProxima] = useState(proximaReunion)
  const [guardando, setGuardando] = useState(false)
  const [ok, setOk] = useState(false)
  const ultimaReunion = reuniones[0]

  async function guardarProxima() {
    setGuardando(true)
    await fetch('/api/proxima-reunion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valor: proxima }),
    })
    setGuardando(false)
    setOk(true)
    router.refresh()
    setTimeout(() => setOk(false), 3000)
  }

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {/* Próxima reunión */}
      <div className="card" style={{ borderLeft: '4px solid var(--dorado)' }}>
        <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: 'var(--azul)' }}>📅 Próxima reunión</h2>
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: 'var(--texto-suave)' }}>
          Este texto aparece visible para todos los apoderados en la página principal.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={proxima}
            onChange={e => setProxima(e.target.value)}
            placeholder="Ej: Jueves 15 de Mayo 2026 a las 19:00 hrs — Sala de clases"
            style={{ flex: 1, minWidth: '200px' }}
          />
          <button onClick={guardarProxima} className="btn-primary" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Publicar'}
          </button>
          {ok && <span style={{ color: '#16a34a', fontSize: '0.85rem', fontWeight: 600 }}>✓ Publicado</span>}
        </div>
      </div>

      {/* Última reunión */}
      {ultimaReunion && (
        <div className="card">
          <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', color: 'var(--azul)' }}>
            🗓 Última reunión — {formatFecha(ultimaReunion.fecha)}
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <span className="badge-azul">{ultimaReunion.tipo}</span>
            <span className="badge-gris">📍 {ultimaReunion.lugar}</span>
            <span className="badge-gris">👥 {ultimaReunion.asistentes_count} asistentes</span>
          </div>
          {ultimaReunion.resumen && (
            <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: 'var(--texto)', lineHeight: 1.6 }}>
              {ultimaReunion.resumen}
            </p>
          )}
          {ultimaReunion.actas?.[0] && (
            <div style={{ background: 'var(--fondo)', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
              <p style={{ margin: '0 0 0.4rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--texto-suave)' }}>Acta</p>
              <p style={{ margin: 0, fontSize: '0.875rem', whiteSpace: 'pre-line', color: 'var(--texto)', lineHeight: 1.6 }}>
                {ultimaReunion.actas[0].contenido}
              </p>
            </div>
          )}
          <BotonWhatsapp reunion={ultimaReunion} />
        </div>
      )}

      {/* Decisiones pendientes */}
      {decisiones.filter(d => d.estado !== 'Cumplida').length > 0 && (
        <div className="card">
          <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', color: 'var(--azul)' }}>✅ Compromisos pendientes</h2>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {decisiones.filter(d => d.estado !== 'Cumplida').map(d => (
              <FilaDecision key={d.id} decision={d} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── REUNIONES ───────────────────────────────────────────── */
function VistaReuniones({ reuniones }: { reuniones: Reunion[] }) {
  const [mostrando, setMostrando] = useState<'lista' | 'nueva'>('lista')
  const router = useRouter()

  async function eliminarReunion(id: string) {
    if (!confirm('¿Eliminar esta reunión y su acta?')) return
    await fetch(`/api/reuniones/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button onClick={() => setMostrando('lista')} className={mostrando === 'lista' ? 'btn-primary' : 'btn-ghost'} style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}>
          Historial ({reuniones.length})
        </button>
        <button onClick={() => setMostrando('nueva')} className={mostrando === 'nueva' ? 'btn-primary' : 'btn-ghost'} style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}>
          + Nueva reunión
        </button>
      </div>

      {mostrando === 'nueva' && <FormNuevaReunion onGuardado={() => { setMostrando('lista'); router.refresh() }} />}

      {mostrando === 'lista' && (
        reuniones.length === 0
          ? <p style={{ color: 'var(--texto-suave)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>Sin reuniones registradas aún</p>
          : <div style={{ display: 'grid', gap: '1rem' }}>
              {reuniones.map(r => (
                <div key={r.id} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div>
                      <p style={{ margin: '0 0 0.3rem', fontWeight: 700, fontSize: '1rem', color: 'var(--azul)' }}>
                        {formatFecha(r.fecha)}
                      </p>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span className="badge-azul">{r.tipo}</span>
                        <span className="badge-gris">📍 {r.lugar}</span>
                        <span className="badge-gris">👥 {r.asistentes_count} asistentes</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <BotonWhatsapp reunion={r} small />
                      <button onClick={() => eliminarReunion(r.id)} className="btn-ghost" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', color: 'var(--rojo)' }}>
                        🗑
                      </button>
                    </div>
                  </div>
                  {r.resumen && <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', color: 'var(--texto)', lineHeight: 1.6 }}>{r.resumen}</p>}
                  {r.actas?.[0] && (
                    <div style={{ background: 'var(--fondo)', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '0.75rem' }}>
                      <p style={{ margin: '0 0 0.4rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--texto-suave)' }}>Acta</p>
                      <p style={{ margin: 0, fontSize: '0.85rem', whiteSpace: 'pre-line', color: 'var(--texto)', lineHeight: 1.6 }}>{r.actas[0].contenido}</p>
                    </div>
                  )}
                  {r.decisiones && r.decisiones.length > 0 && (
                    <div>
                      <p style={{ margin: '0 0 0.4rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--texto-suave)' }}>
                        Decisiones ({r.decisiones.length})
                      </p>
                      <div style={{ display: 'grid', gap: '0.3rem' }}>
                        {r.decisiones.map(d => <FilaDecision key={d.id} decision={d} compact />)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
      )}
    </div>
  )
}

/* ─── FORM NUEVA REUNIÓN ──────────────────────────────────── */
function FormNuevaReunion({ onGuardado }: { onGuardado: () => void }) {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [hora, setHora] = useState('19:00')
  const [tipo, setTipo] = useState<'Ordinaria' | 'Extraordinaria' | 'Emergencia'>('Ordinaria')
  const [lugar, setLugar] = useState('Sala de clases')
  const [asistentes, setAsistentes] = useState('')
  const [resumen, setResumen] = useState('')
  const [acta, setActa] = useState('')
  const [decisiones, setDecisiones] = useState([{ descripcion: '', responsable: '', fecha_limite: '' }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function agregarDecision() {
    setDecisiones(d => [...d, { descripcion: '', responsable: '', fecha_limite: '' }])
  }

  function actualizarDecision(i: number, campo: string, valor: string) {
    setDecisiones(d => d.map((dec, idx) => idx === i ? { ...dec, [campo]: valor } : dec))
  }

  function quitarDecision(i: number) {
    setDecisiones(d => d.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!resumen.trim()) { setError('Ingresa un resumen de la reunión'); return }
    setLoading(true)
    const res = await fetch('/api/reuniones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fecha, tipo, lugar,
        asistentes_count: parseInt(asistentes) || 0,
        resumen: resumen.trim(),
        acta,
        decisiones: decisiones.filter(d => d.descripcion.trim()),
      }),
    })
    setLoading(false)
    if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Error al guardar'); return }
    onGuardado()
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '1rem' }}>
      <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: 'var(--azul)' }}>Nueva reunión</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <label>Fecha</label>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
        </div>
        <div>
          <label>Tipo</label>
          <select value={tipo} onChange={e => setTipo(e.target.value as typeof tipo)}>
            {REUNION_TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label>Lugar</label>
          <input type="text" value={lugar} onChange={e => setLugar(e.target.value)} placeholder="Sala de clases" />
        </div>
        <div>
          <label>Hora</label>
          <input type="time" value={hora} onChange={e => setHora(e.target.value)} />
        </div>
        <div>
          <label>N° asistentes</label>
          <input type="number" value={asistentes} onChange={e => setAsistentes(e.target.value)} placeholder="0" min="0" />
        </div>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <label>Resumen general</label>
        <textarea value={resumen} onChange={e => setResumen(e.target.value)} placeholder="Descripción breve de los temas tratados..." rows={3} style={{ resize: 'vertical' }} />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Acta detallada</label>
        <textarea value={acta} onChange={e => setActa(e.target.value)} placeholder="Detalle completo de lo visto en la reunión..." rows={5} style={{ resize: 'vertical' }} />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label style={{ margin: 0 }}>Decisiones y compromisos</label>
          <button type="button" onClick={agregarDecision} className="btn-ghost" style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}>+ Agregar</button>
        </div>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {decisiones.map((d, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '0.4rem', alignItems: 'center' }}>
              <input type="text" value={d.descripcion} onChange={e => actualizarDecision(i, 'descripcion', e.target.value)} placeholder="Descripción del acuerdo" />
              <input type="text" value={d.responsable} onChange={e => actualizarDecision(i, 'responsable', e.target.value)} placeholder="Responsable" />
              <input type="date" value={d.fecha_limite} onChange={e => actualizarDecision(i, 'fecha_limite', e.target.value)} style={{ minWidth: '130px' }} />
              {decisiones.length > 1 && (
                <button type="button" onClick={() => quitarDecision(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rojo)', fontSize: '1rem', padding: '0 0.25rem' }}>✕</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && <p style={{ color: 'var(--rojo)', fontSize: '0.85rem', margin: '0 0 0.75rem' }}>{error}</p>}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Guardando...' : 'Guardar reunión'}</button>
        <button type="button" className="btn-ghost" onClick={onGuardado}>Cancelar</button>
      </div>
    </form>
  )
}

/* ─── DECISIONES ──────────────────────────────────────────── */
function VistaDecisiones({ decisiones, reuniones }: { decisiones: Decision[]; reuniones: Reunion[] }) {
  const [filtro, setFiltro] = useState<DecisionEstado | 'Todas'>('Todas')
  const filtradas = filtro === 'Todas' ? decisiones : decisiones.filter(d => d.estado === filtro)

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {(['Todas', ...DECISION_ESTADOS] as const).map(e => (
          <button key={e} onClick={() => setFiltro(e)} style={{
            padding: '0.3rem 0.75rem', borderRadius: '9999px', border: '1px solid', fontSize: '0.8rem',
            fontFamily: 'var(--font-body)', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
            borderColor: filtro === e ? 'var(--azul)' : 'var(--borde)',
            background: filtro === e ? 'var(--azul)' : 'white',
            color: filtro === e ? 'white' : 'var(--texto-suave)',
          }}>{e}</button>
        ))}
      </div>
      {filtradas.length === 0
        ? <p style={{ color: 'var(--texto-suave)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>Sin decisiones en este estado</p>
        : <div style={{ display: 'grid', gap: '0.5rem' }}>
            {filtradas.map(d => <FilaDecision key={d.id} decision={d} reuniones={reuniones} editable />)}
          </div>
      }
    </div>
  )
}

function FilaDecision({ decision: d, reuniones, compact, editable }: {
  decision: Decision; reuniones?: Reunion[]; compact?: boolean; editable?: boolean
}) {
  const router = useRouter()
  const [estado, setEstado] = useState<DecisionEstado>(d.estado)
  const [guardando, setGuardando] = useState(false)

  async function cambiarEstado(nuevoEstado: DecisionEstado) {
    setEstado(nuevoEstado)
    setGuardando(true)
    await fetch(`/api/decisiones/${d.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado }),
    })
    setGuardando(false)
    router.refresh()
  }

  async function eliminar() {
    if (!confirm('¿Eliminar esta decisión?')) return
    await fetch(`/api/decisiones/${d.id}`, { method: 'DELETE' })
    router.refresh()
  }

  const reunion = reuniones?.find(r => r.id === d.reunion_id)
  const colorEstado = estado === 'Cumplida' ? 'badge-verde' : estado === 'En proceso' ? 'badge-dorado' : 'badge-rojo'

  return (
    <div style={{
      padding: compact ? '0.5rem 0.75rem' : '0.75rem 1rem',
      background: estado === 'Cumplida' ? '#f0fdf4' : 'var(--fondo)',
      borderRadius: '0.5rem',
      border: `1px solid ${estado === 'Cumplida' ? '#bbf7d0' : 'var(--borde)'}`,
      display: 'flex', alignItems: compact ? 'center' : 'flex-start', gap: '0.75rem', flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: '200px' }}>
        <p style={{ margin: '0 0 0.2rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--texto)' }}>{d.descripcion}</p>
        {!compact && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--texto-suave)' }}>
            {d.responsable && <span>👤 {d.responsable}</span>}
            {d.fecha_limite && <span>📅 Límite: {formatFecha(d.fecha_limite)}</span>}
            {reunion && <span>📋 {formatFecha(reunion.fecha)}</span>}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
        <span className={colorEstado}>{estado}</span>
        {editable && (
          <>
            <select
              value={estado}
              onChange={e => cambiarEstado(e.target.value as DecisionEstado)}
              disabled={guardando}
              style={{ fontSize: '0.78rem', padding: '0.2rem 0.4rem', width: 'auto' }}
            >
              {DECISION_ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <button onClick={eliminar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texto-suave)', fontSize: '0.9rem', padding: '0.1rem 0.2rem' }}>🗑</button>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── AVISOS ──────────────────────────────────────────────── */
function VistaAvisos({ avisos }: { avisos: Aviso[] }) {
  const router = useRouter()
  const [mostrando, setMostrando] = useState<'lista' | 'nuevo'>('lista')
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')
  const [destacado, setDestacado] = useState(false)
  const [loading, setLoading] = useState(false)

  async function guardarAviso(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim() || !contenido.trim()) return
    setLoading(true)
    await fetch('/api/avisos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: titulo.trim(), contenido: contenido.trim(), destacado }),
    })
    setLoading(false)
    setTitulo(''); setContenido(''); setDestacado(false)
    setMostrando('lista')
    router.refresh()
  }

  async function eliminarAviso(id: string) {
    if (!confirm('¿Eliminar este aviso?')) return
    await fetch(`/api/avisos/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  async function toggleDestacado(aviso: Aviso) {
    await fetch(`/api/avisos/${aviso.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destacado: !aviso.destacado }),
    })
    router.refresh()
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button onClick={() => setMostrando('lista')} className={mostrando === 'lista' ? 'btn-primary' : 'btn-ghost'} style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}>
          Avisos ({avisos.length})
        </button>
        <button onClick={() => setMostrando('nuevo')} className={mostrando === 'nuevo' ? 'btn-primary' : 'btn-ghost'} style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}>
          + Nuevo aviso
        </button>
      </div>

      {mostrando === 'nuevo' && (
        <form onSubmit={guardarAviso} className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label>Título</label>
            <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ej: Recordatorio reunión de apoderados" />
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label>Contenido</label>
            <textarea value={contenido} onChange={e => setContenido(e.target.value)} rows={4} placeholder="Detalle del aviso..." style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <input type="checkbox" id="destacado" checked={destacado} onChange={e => setDestacado(e.target.checked)} style={{ width: 'auto' }} />
            <label htmlFor="destacado" style={{ margin: 0, fontSize: '0.875rem', textTransform: 'none', letterSpacing: 0, fontWeight: 500 }}>Marcar como destacado</label>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Guardando...' : 'Publicar aviso'}</button>
            <button type="button" className="btn-ghost" onClick={() => setMostrando('lista')}>Cancelar</button>
          </div>
        </form>
      )}

      {mostrando === 'lista' && (
        avisos.length === 0
          ? <p style={{ color: 'var(--texto-suave)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>Sin avisos publicados</p>
          : <div style={{ display: 'grid', gap: '0.75rem' }}>
              {avisos.map(a => (
                <div key={a.id} className="card" style={{ padding: '1rem', borderLeft: a.destacado ? '4px solid var(--dorado)' : '1px solid var(--borde)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: 'var(--azul)' }}>{a.titulo}</p>
                    <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                      <button onClick={() => toggleDestacado(a)} title={a.destacado ? 'Quitar destacado' : 'Destacar'} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '0.1rem' }}>
                        {a.destacado ? '⭐' : '☆'}
                      </button>
                      <button onClick={() => eliminarAviso(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texto-suave)', fontSize: '0.9rem', padding: '0.1rem' }}>🗑</button>
                    </div>
                  </div>
                  <p style={{ margin: '0 0 0.4rem', fontSize: '0.85rem', color: 'var(--texto)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{a.contenido}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--texto-suave)' }}>
                    {new Date(a.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}
                    {a.destacado && <span className="badge-dorado" style={{ marginLeft: '0.5rem' }}>Destacado</span>}
                  </p>
                </div>
              ))}
            </div>
      )}
    </div>
  )
}

/* ─── BOTÓN WHATSAPP ──────────────────────────────────────── */
function BotonWhatsapp({ reunion, small }: { reunion: Reunion; small?: boolean }) {
  function generarTexto() {
    const lineas = [
      `📋 *Acta Reunión 1°B — ${formatFecha(reunion.fecha)}${reunion.hora ? ' · ' + reunion.hora + ' hrs' : ''}*`,
      `_Esc. Hermano Leovigildo Kley_`,
      ``,
      `📍 Lugar: ${reunion.lugar}`,
      `👥 Asistentes: ${reunion.asistentes_count}`,
      ``,
    ]
    if (reunion.resumen) lineas.push(`📝 *Resumen:*\n${reunion.resumen}`, ``)
    if (reunion.actas?.[0]) lineas.push(`📄 *Acta:*\n${reunion.actas[0].contenido}`, ``)
    if (reunion.decisiones?.length) {
      lineas.push(`✅ *Decisiones tomadas:*`)
      reunion.decisiones.forEach((d, i) => {
        lineas.push(`${i + 1}. ${d.descripcion}${d.responsable ? ` (${d.responsable})` : ''}`)
      })
    }
    return lineas.join('\n')
  }

  function abrir() {
    const texto = generarTexto()
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
  }

  return (
    <button onClick={abrir} className="btn-ghost" style={{ padding: small ? '0.3rem 0.6rem' : '0.45rem 1rem', fontSize: small ? '0.8rem' : '0.875rem', color: '#25d366', borderColor: '#25d366' }}>
      📤 {small ? 'WA' : 'Compartir por WhatsApp'}
    </button>
  )
}

/* ─── HELPERS ─────────────────────────────────────────────── */
function Tarjeta({ label, valor, destacado, alerta }: { label: string; valor: string; destacado?: boolean; alerta?: boolean }) {
  return (
    <div className="card" style={{ background: destacado ? 'var(--azul)' : 'white', border: alerta ? '2px solid var(--dorado)' : destacado ? '2px solid var(--dorado)' : '1px solid var(--borde)', padding: '1rem' }}>
      <p style={{ margin: '0 0 0.3rem', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: destacado ? 'rgba(255,255,255,0.7)' : 'var(--texto-suave)' }}>{label}</p>
      <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: destacado ? 'white' : alerta ? 'var(--dorado-oscuro)' : 'var(--texto)' }}>{valor}</p>
    </div>
  )
}

function formatFecha(fecha: string) {
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
