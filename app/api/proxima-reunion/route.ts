import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requiereRol } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const ok = await requiereRol('secretaria')
  if (!ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { valor } = await req.json()
  const { error } = await supabaseAdmin
    .from('config')
    .update({ valor: valor ?? '' })
    .eq('clave', 'proxima_reunion')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
