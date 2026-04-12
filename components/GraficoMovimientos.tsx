'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { MESES_2026, type Movimiento } from '@/lib/types'

interface Props {
  movimientos: Movimiento[]
}

function formatMiles(value: number) {
  if (value === 0) return '$0'
  return '$' + (value / 1000).toFixed(0) + 'k'
}

export default function GraficoMovimientos({ movimientos }: Props) {
  const data = MESES_2026.map(({ key, label }) => {
    const ingresos = movimientos
      .filter(m => m.monto > 0 && m.fecha.startsWith(key))
      .reduce((s, m) => s + m.monto, 0)
    const gastos = movimientos
      .filter(m => m.monto < 0 && m.fecha.startsWith(key))
      .reduce((s, m) => s + Math.abs(m.monto), 0)
    return { mes: label, Ingresos: ingresos, Gastos: gastos }
  })

  const hayDatos = data.some(d => d.Ingresos > 0 || d.Gastos > 0)

  if (!hayDatos) {
    return (
      <div style={{
        height: 180,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--texto-suave)',
        fontSize: '0.875rem',
        background: 'var(--fondo)',
        borderRadius: '0.5rem',
      }}>
        Sin movimientos registrados aún
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barGap={4}>
        <XAxis
          dataKey="mes"
          tick={{ fontSize: 11, fill: 'var(--texto-suave)', fontFamily: 'var(--font-body)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatMiles}
          tick={{ fontSize: 11, fill: 'var(--texto-suave)', fontFamily: 'var(--font-body)' }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          formatter={(value: number) => ['$' + value.toLocaleString('es-CL')]}
          contentStyle={{
            border: '1px solid var(--borde)',
            borderRadius: '0.5rem',
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: '0.8rem', fontFamily: 'var(--font-body)', paddingTop: '0.5rem' }}
        />
        <Bar dataKey="Ingresos" fill="var(--azul)" radius={[4, 4, 0, 0]} maxBarSize={32} />
        <Bar dataKey="Gastos" fill="var(--dorado)" radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  )
}
