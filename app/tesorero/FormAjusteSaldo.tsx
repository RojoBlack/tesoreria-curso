'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  ajusteActual: number
  descripcionActual: string
}

export default function FormAjusteSaldo({ ajusteActual, descripcionActual }: Props) {
  const router = useRouter()
  const [monto, setMonto] = useState(ajusteActual === 0 ? '' : String(ajusteActual))
  const [descripcion, setDescripcion] = useState(descripcionActual)
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setOk(false)
    const valor = Number(monto)
    if (isNaN(valor)) { setError('Ingresa un número válido'); return }
    setLoading(true)
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ajuste_saldo: String(valor),
        ajuste_saldo_descripcion: descripcion.trim(),
      }),
    })
    setLoading(false)
    if (!res.ok) { setError('Error al guardar'); return }
    setOk(true)
    router.refresh()
    setTimeout(() => setOk(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
      <div style={{ minWidth: '140px' }}>
        <label>Monto ($)</label>
        <input
          type="number"
          value={monto}
          onChange={e => setMonto(e.target.value)}
          placeholder="6000"
        />
      </div>
      <div style={{ flex: 1, minWidth: '200px' }}>
        <label>Descripción</label>
        <input
          type="text"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          placeholder="Ej: 3 pagos en efectivo recibidos en Marzo"
        />
      </div>
      <div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar ajuste'}
        </button>
      </div>
      {error && <p style={{ color: 'var(--rojo)', fontSize: '0.85rem', margin: '0.25rem 0 0', width: '100%' }}>{error}</p>}
      {ok && <p style={{ color: 'var(--verde)', fontSize: '0.85rem', margin: '0.25rem 0 0', width: '100%', fontWeight: 600 }}>✓ Ajuste guardado</p>}
    </form>
  )
}
