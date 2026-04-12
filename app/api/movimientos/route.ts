import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requiereRol } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const ok = await requiereRol('tesorero')
  if (!ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const { fecha, categoria, descripcion, monto, alumno_id, mes_cuota } = body

  if (!fecha || !categoria || !descripcion || monto === undefined) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  if (categoria === 'Cuotas' && monto > 0 && alumno_id && mes_cuota) {
    const { data: existe } = await supabaseAdmin
      .from('movimientos')
      .select('id')
      .eq('alumno_id', alumno_id)
      .eq('mes_cuota', mes_cuota)
      .eq('categoria', 'Cuotas')
      .gt('monto', 0)
      .single()

    if (existe) {
      return NextResponse.json({ error: 'Esta cuota ya fue registrada para ese alumno y mes' }, { status: 409 })
    }
  }

  const { error } = await supabaseAdmin.from('movimientos').insert({
    fecha,
    categoria,
    descripcion,
    monto,
    alumno_id: alumno_id || null,
    mes_cuota: mes_cuota || null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
