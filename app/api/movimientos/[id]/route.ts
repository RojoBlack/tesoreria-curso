import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requiereRol } from '@/lib/auth'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ok = await requiereRol('tesorero')
  if (!ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await params
  const { error } = await supabaseAdmin.from('movimientos').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ok = await requiereRol('tesorero')
  if (!ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const campos: Record<string, unknown> = {}
  if (body.fecha)             campos.fecha = body.fecha
  if (body.descripcion)       campos.descripcion = body.descripcion
  if (body.categoria)         campos.categoria = body.categoria
  if (body.monto !== undefined) campos.monto = body.monto
  const { error } = await supabaseAdmin.from('movimientos').update(campos).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
