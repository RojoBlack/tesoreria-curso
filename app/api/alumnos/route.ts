import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requiereRol } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const ok = await requiereRol('tesorero')
  if (!ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { nombre, codigo_apoderado } = await req.json()
  if (!nombre || !codigo_apoderado) {
    return NextResponse.json({ error: 'Nombre y código son obligatorios' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from('alumnos').insert({ nombre, codigo_apoderado })
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'El código ya existe' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
