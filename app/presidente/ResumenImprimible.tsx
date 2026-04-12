'use client'
import { formatCLP, MESES_2026, type Alumno } from '@/lib/types'

interface Props {
  alumnos: Alumno[]
  saldo: number
  totalIngresos: number
  totalGastos: number
  totalRecaudado: number
  totalEsperado: number
  alumnosAlDia: number
  pagosMap: Record<string, string[]>
  cuotaMensual: number
}

export default function ResumenImprimible({ alumnos, saldo, totalIngresos, totalGastos, totalRecaudado, totalEsperado, alumnosAlDia, pagosMap, cuotaMensual }: Props) {

  function imprimir() {
    const alumnosConPendiente = alumnos
      .map(a => ({
        nombre: a.nombre,
        pagados: (pagosMap[a.id] ?? []).length,
        pendiente: (MESES_2026.length - (pagosMap[a.id] ?? []).length) * cuotaMensual,
      }))
      .filter(a => a.pendiente > 0)
      .sort((a, b) => b.pendiente - a.pendiente)

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Resumen Tesorería 1°B — ${new Date().toLocaleDateString('es-CL')}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 700px; margin: 2rem auto; color: #1a2640; font-size: 14px; }
    h1 { font-size: 1.4rem; margin-bottom: 0.25rem; }
    h2 { font-size: 1rem; margin: 1.5rem 0 0.5rem; border-bottom: 2px solid #c9a227; padding-bottom: 0.25rem; color: #1a3a6b; }
    .subtitulo { color: #5a6a85; font-size: 0.85rem; margin-bottom: 1.5rem; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem; }
    .tarjeta { border: 1px solid #dde3ed; border-radius: 0.5rem; padding: 0.75rem 1rem; }
    .tarjeta.principal { background: #1a3a6b; color: white; border-color: #c9a227; border-width: 2px; }
    .tarjeta-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.7; margin-bottom: 0.2rem; }
    .tarjeta-valor { font-size: 1.3rem; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    th { text-align: left; padding: 0.4rem 0.5rem; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: #5a6a85; border-bottom: 2px solid #dde3ed; }
    td { padding: 0.4rem 0.5rem; border-bottom: 1px solid #dde3ed; }
    .verde { color: #16a34a; font-weight: 600; }
    .rojo { color: #dc2626; font-weight: 600; }
    .pie { margin-top: 2rem; font-size: 0.78rem; color: #5a6a85; text-align: center; }
    @media print { body { margin: 1rem; } }
  </style>
</head>
<body>
  <h1>Tesorería 1°B — Esc. Hermano Leovigildo Kley</h1>
  <p class="subtitulo">Resumen generado el ${new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>

  <div class="grid">
    <div class="tarjeta principal">
      <div class="tarjeta-label">Saldo disponible</div>
      <div class="tarjeta-valor">${formatCLP(saldo)}</div>
    </div>
    <div class="tarjeta">
      <div class="tarjeta-label">Total ingresos</div>
      <div class="tarjeta-valor">${formatCLP(totalIngresos)}</div>
    </div>
    <div class="tarjeta">
      <div class="tarjeta-label">Total gastos</div>
      <div class="tarjeta-valor">${formatCLP(Math.abs(totalGastos))}</div>
    </div>
    <div class="tarjeta">
      <div class="tarjeta-label">Cuotas recaudadas</div>
      <div class="tarjeta-valor">${formatCLP(totalRecaudado)}</div>
    </div>
    <div class="tarjeta">
      <div class="tarjeta-label">Por recaudar</div>
      <div class="tarjeta-valor">${formatCLP(totalEsperado - totalRecaudado)}</div>
    </div>
    <div class="tarjeta">
      <div class="tarjeta-label">Alumnos al día</div>
      <div class="tarjeta-valor">${alumnosAlDia} / ${alumnos.length}</div>
    </div>
  </div>

  ${alumnosConPendiente.length > 0 ? `
  <h2>Alumnos con cuotas pendientes (${alumnosConPendiente.length})</h2>
  <table>
    <thead><tr><th>Alumno</th><th>Meses pagados</th><th>Monto pendiente</th></tr></thead>
    <tbody>
      ${alumnosConPendiente.map(a => `
        <tr>
          <td>${a.nombre}</td>
          <td>${a.pagados} / ${MESES_2026.length}</td>
          <td class="rojo">${formatCLP(a.pendiente)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : '<h2>✓ Todos los alumnos están al día</h2>'}

  <p class="pie">Documento generado automáticamente · Tesorería 1°B 2026</p>
</body>
</html>`

    const ventana = window.open('', '_blank')
    if (!ventana) return
    ventana.document.write(html)
    ventana.document.close()
    ventana.focus()
    setTimeout(() => ventana.print(), 500)
  }

  return (
    <button onClick={imprimir} className="btn-ghost"
      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
      🖨 Imprimir resumen
    </button>
  )
}
