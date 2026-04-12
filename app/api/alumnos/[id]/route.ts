import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requiereRol } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ok = await requiereRol('tesorero')
  if (!ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const campos: Record<string, unknown> = {}
  if (typeof body.activo === 'boolean') campos.activo = body.activo
  if (typeof body.codigo_apoderado === 'string') campos.codigo_apoderado = body.codigo_apoderado
  if (Object.keys(campos).length === 0) return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })
  const { error } = await supabaseAdmin.from('alumnos').update(campos).eq('id', id)
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'El código ya existe' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ok = await requiereRol('tesorero')
  if (!ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await params
  const { error } = await supabaseAdmin.from('alumnos').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
