import { obtenerSesion } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { formatCLP, type Movimiento, type Config, type Donacion } from '@/lib/types'
import type { Reunion, Aviso } from '@/lib/types-secretaria'
import GraficoMovimientos from '@/components/GraficoMovimientos'
import TablaMovimientos from '@/components/TablaMovimientos'
import Link from 'next/link'
import Image from 'next/image'

export const revalidate = 60

async function getDatos() {
  const [
    { data: movimientos },
    { data: configRows },
    { data: reuniones },
    { data: avisos },
    { data: donaciones },
  ] = await Promise.all([
    supabase.from('movimientos').select('*, alumnos(nombre)').order('fecha', { ascending: false }),
    supabase.from('config').select('*'),
    supabase.from('reuniones').select('*, actas(*), decisiones(*)').order('fecha', { ascending: false }).limit(1),
    supabase.from('avisos').select('*').order('destacado', { ascending: false }).order('created_at', { ascending: false }),
    supabase.from('donaciones').select('*, alumnos(nombre)').order('convivencia').order('created_at', { ascending: true }),
  ])

  const config: Config = {}
  for (const row of configRows ?? []) config[row.clave] = row.valor

  return {
    movimientos: (movimientos ?? []) as Movimiento[],
    config,
    ultimaReunion: ((reuniones ?? []) as Reunion[])[0] ?? null,
    avisos: (avisos ?? []) as Aviso[],
    donaciones: (donaciones ?? []) as Donacion[],
  }
}

export default async function Home() {
  const rol = await obtenerSesion()
  const { movimientos, config, ultimaReunion, avisos, donaciones } = await getDatos()

  const totalIngresos = movimientos.filter(m => m.monto > 0).reduce((s, m) => s + m.monto, 0)
  const totalGastos = movimientos.filter(m => m.monto < 0).reduce((s, m) => s + m.monto, 0)
  const saldo = totalIngresos + totalGastos
  const proximaReunion = config.proxima_reunion ?? ''

  // Agrupar donaciones por convivencia
  const donacionesPorConvivencia = donaciones.reduce((acc, d) => {
    if (!acc[d.convivencia]) acc[d.convivencia] = []
    acc[d.convivencia].push(d)
    return acc
  }, {} as Record<string, Donacion[]>)

  return (
    <>
      <Navbar rol={rol} />
      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>

        {/* Encabezado */}
        <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <Image src="/logo-colegio.png" alt="Logo" width={64} height={64} style={{ borderRadius: '50%', border: '3px solid var(--dorado)', flexShrink: 0 }} />
          <div>
            <h1 style={{ margin: '0 0 0.1rem', fontSize: 'clamp(1.4rem, 5vw, 2rem)', color: 'var(--azul)' }}>
              Tesorería 1°B
            </h1>
            <p style={{ margin: 0, color: 'var(--texto-suave)', fontSize: '0.9rem' }}>
              Escuela Hermano Leovigildo Kley · Cunco · 2026
            </p>
          </div>
        </header>

        {/* Avisos destacados */}
        {avisos.filter(a => a.destacado).map(a => (
          <div key={a.id} style={{
            marginBottom: '1rem',
            padding: '0.875rem 1.25rem',
            background: 'var(--dorado-claro)',
            border: '1px solid var(--dorado)',
            borderRadius: '0.75rem',
            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
          }}>
            <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>📢</span>
            <div>
              <p style={{ margin: '0 0 0.2rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--dorado-oscuro)' }}>{a.titulo}</p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--texto)', whiteSpace: 'pre-line' }}>{a.contenido}</p>
            </div>
          </div>
        ))}

        {/* Próxima reunión */}
        {proximaReunion && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '0.875rem 1.25rem',
            background: 'var(--azul-claro)',
            border: '1px solid #b8c8e8',
            borderRadius: '0.75rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <span style={{ fontSize: '1.3rem' }}>📅</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--azul)' }}>Próxima reunión de apoderados</p>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--texto)' }}>{proximaReunion}</p>
            </div>
          </div>
        )}

        {/* Tarjetas saldo */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <TarjetaSaldo label="Saldo disponible" monto={saldo} destacado />
          <TarjetaSaldo label="Total ingresos" monto={totalIngresos} />
          <TarjetaSaldo label="Total gastos" monto={Math.abs(totalGastos)} negativo />
        </div>

        {/* Gráfico */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: 'var(--azul)' }}>Ingresos vs Gastos por mes</h2>
          <GraficoMovimientos movimientos={movimientos} />
        </div>

        {/* Banner apoderado */}
        <div className="card" style={{
          marginBottom: '1.5rem',
          background: 'var(--azul-claro)',
          border: '1px solid #b8c8e8',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1rem',
        }}>
          <div>
            <p style={{ margin: '0 0 0.2rem', fontWeight: 700, color: 'var(--azul)' }}>¿Eres apoderado?</p>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--azul-medio)', opacity: 0.85 }}>
              Consulta el estado de pago de tu hijo/a con tu código personal.
            </p>
          </div>
          <Link href="/consulta" className="btn-primary">Consultar mi estado →</Link>
        </div>

        {/* Última reunión */}
        {ultimaReunion && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.1rem', color: 'var(--azul)' }}>
              🗓 Última reunión
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <span className="badge-azul">{ultimaReunion.tipo}</span>
              <span className="badge-gris">
                {new Date(ultimaReunion.fecha + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}{ultimaReunion.hora ? ` · ${ultimaReunion.hora} hrs` : ''}
              </span>
              <span className="badge-gris">📍 {ultimaReunion.lugar}</span>
              <span className="badge-gris">👥 {ultimaReunion.asistentes_count} asistentes</span>
            </div>
            {ultimaReunion.resumen && (
              <p style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: 'var(--texto)', lineHeight: 1.6 }}>
                {ultimaReunion.resumen}
              </p>
            )}
            {ultimaReunion.actas?.[0] && (
              <div style={{ background: 'var(--fondo)', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '0.75rem' }}>
                <p style={{ margin: '0 0 0.4rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--texto-suave)' }}>Acta</p>
                <p style={{ margin: 0, fontSize: '0.875rem', whiteSpace: 'pre-line', color: 'var(--texto)', lineHeight: 1.6 }}>
                  {ultimaReunion.actas[0].contenido}
                </p>
              </div>
            )}
            {ultimaReunion.decisiones && ultimaReunion.decisiones.length > 0 && (
              <div>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--texto-suave)' }}>
                  Decisiones ({ultimaReunion.decisiones.length})
                </p>
                <div style={{ display: 'grid', gap: '0.3rem' }}>
                  {ultimaReunion.decisiones.map((d) => (
                    <div key={d.id} style={{ padding: '0.4rem 0.75rem', background: 'var(--fondo)', borderRadius: '0.4rem', fontSize: '0.875rem', color: 'var(--texto)' }}>
                      • {d.descripcion}
                      {d.responsable && <span style={{ color: 'var(--texto-suave)', fontSize: '0.8rem' }}> · {d.responsable}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Avisos no destacados */}
        {avisos.filter(a => !a.destacado).length > 0 && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: 'var(--azul)' }}>📢 Avisos</h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {avisos.filter(a => !a.destacado).map(a => (
                <div key={a.id} style={{ borderBottom: '1px solid var(--borde)', paddingBottom: '0.75rem' }}>
                  <p style={{ margin: '0 0 0.2rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--texto)' }}>{a.titulo}</p>
                  <p style={{ margin: '0 0 0.2rem', fontSize: '0.85rem', color: 'var(--texto)', whiteSpace: 'pre-line' }}>{a.contenido}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--texto-suave)' }}>
                    {new Date(a.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'long' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Movimientos */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: 'var(--azul)' }}>Registro de movimientos</h2>
          <TablaMovimientos movimientos={movimientos} />
        </div>

        {/* Donaciones convivencias */}
        {Object.keys(donacionesPorConvivencia).length > 0 && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem', color: 'var(--azul)' }}>
              🎉 Donaciones para convivencias
            </h2>
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.82rem', color: 'var(--texto-suave)' }}>
              Aportes voluntarios de los apoderados para las actividades del curso.
            </p>
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              {Object.entries(donacionesPorConvivencia).map(([convivencia, lista]) => (
                <div key={convivencia}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    marginBottom: '0.75rem',
                  }}>
                    <span style={{
                      display: 'inline-block',
                      background: 'var(--dorado)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      padding: '0.2rem 0.75rem',
                      borderRadius: '999px',
                      letterSpacing: '0.03em',
                    }}>
                      {convivencia}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--texto-suave)' }}>
                      {lista.length} {lista.length === 1 ? 'aporte' : 'aportes'}
                    </span>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '0.5rem',
                  }}>
                    {lista.map(d => (
                      <div key={d.id} style={{
                        background: 'var(--fondo)',
                        border: '1px solid var(--borde)',
                        borderRadius: '0.6rem',
                        padding: '0.65rem 0.9rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.6rem',
                      }}>
                        <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '0.05rem' }}>🎁</span>
                        <div>
                          <p style={{ margin: '0 0 0.1rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--texto)' }}>
                            {d.alumnos?.nombre ?? '—'}
                          </p>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--texto-suave)' }}>
                            {d.descripcion}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info pago */}
        <InfoPago config={config} />

      </main>
    </>
  )
}

function TarjetaSaldo({ label, monto, destacado, negativo }: {
  label: string; monto: number; destacado?: boolean; negativo?: boolean
}) {
  return (
    <div className="card" style={{
      background: destacado ? 'var(--azul)' : 'white',
      border: destacado ? '2px solid var(--dorado)' : '1px solid var(--borde)',
    }}>
      <p style={{ margin: '0 0 0.3rem', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: destacado ? 'rgba(255,255,255,0.7)' : 'var(--texto-suave)' }}>
        {label}
      </p>
      <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem, 4vw, 1.6rem)', fontWeight: 700, color: destacado ? 'white' : negativo ? 'var(--rojo)' : 'var(--texto)' }}>
        {formatCLP(monto)}
      </p>
    </div>
  )
}

function InfoPago({ config }: { config: Config }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#00b1ea', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: 'white', fontWeight: 800, fontSize: '0.85rem', fontFamily: 'sans-serif' }}>MP</span>
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--azul)' }}>Información de pago</h2>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--texto-suave)' }}>Mercado Pago</p>
        </div>
      </div>
      <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: 'var(--texto-suave)' }}>
        Cuota mensual: <strong style={{ color: 'var(--texto)' }}>{formatCLP(parseInt(config.cuota_mensual ?? '2000'))}</strong>
        {' '}· 10 meses (Marzo–Diciembre 2026)
      </p>
      <div style={{ background: 'var(--fondo)', border: '1px solid var(--borde)', borderRadius: '0.75rem', padding: '1rem', display: 'grid', gap: '0.6rem' }}>
        <FilaInfo etiqueta="Titular" valor="René Alarcón" />
        <FilaInfo etiqueta="RUT" valor="17.950.717-k" />
        <FilaInfo etiqueta="Banco" valor="Mercado Pago" />
        <FilaInfo etiqueta="Tipo de cuenta" valor="Cuenta Vista" />
        <FilaInfo etiqueta="N° de cuenta" valor="1099368439" />
      </div>
      <p style={{ margin: '1rem 0 0', fontSize: '0.8rem', color: 'var(--texto-suave)' }}>
        Al transferir, incluye el nombre del alumno en el comentario o descripción del pago.
      </p>
    </div>
  )
}

function FilaInfo({ etiqueta, valor }: { etiqueta: string; valor?: string }) {
  if (!valor) return null
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--texto-suave)', minWidth: '120px' }}>{etiqueta}</span>
      <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--texto)' }}>{valor}</span>
    </div>
  )
}
