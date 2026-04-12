import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requiereRol } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const ok = await requiereRol('tesorero')
  if (!ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const updates = Object.entries(body).map(([clave, valor]) => ({ clave, valor: String(valor) }))

  for (const { clave, valor } of updates) {
    const { error } = await supabaseAdmin
      .from('config')
      .update({ valor })
      .eq('clave', clave)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
