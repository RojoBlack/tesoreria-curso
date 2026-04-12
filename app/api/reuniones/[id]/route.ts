import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requiereRol } from '@/lib/auth'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ok = await requiereRol('secretaria')
  if (!ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await params
  const { error } = await supabaseAdmin.from('reuniones').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
