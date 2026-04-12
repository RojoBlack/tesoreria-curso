import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requiereRol } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const ok = await requiereRol('secretaria')
  if (!ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const { fecha, hora, tipo, lugar, asistentes_count, resumen, acta, decisiones } = body

  const { data: reunion, error } = await supabaseAdmin
    .from('reuniones')
    .insert({ fecha, hora: hora ?? '19:00', tipo, lugar, asistentes_count, resumen })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (acta?.trim()) {
    await supabaseAdmin.from('actas').insert({ reunion_id: reunion.id, contenido: acta.trim() })
  }

  if (decisiones?.length) {
    const rows = decisiones
      .filter((d: { descripcion: string }) => d.descripcion.trim())
      .map((d: { descripcion: string; responsable: string; fecha_limite: string }) => ({
        reunion_id: reunion.id,
        descripcion: d.descripcion.trim(),
        responsable: d.responsable ?? '',
        fecha_limite: d.fecha_limite || null,
        estado: 'Pendiente',
      }))
    if (rows.length) await supabaseAdmin.from('decisiones').insert(rows)
  }

  return NextResponse.json({ ok: true, id: reunion.id })
}
