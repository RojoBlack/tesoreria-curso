import { NextResponse } from 'next/server'
import { requiereRol } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('donaciones')
    .select('*, alumnos(nombre)')
    .order('convivencia')
    .order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const ok = await requiereRol('tesorero')
  if (!ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { convivencia, alumno_id, descripcion, fecha } = await req.json()
  if (!convivencia || !alumno_id || !descripcion || !fecha) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('donaciones')
    .insert({ convivencia, alumno_id, descripcion, fecha })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
