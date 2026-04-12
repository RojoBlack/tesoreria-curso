import { NextRequest, NextResponse } from 'next/server'
import { crearSesion } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (password === process.env.PASSWORD_TESORERO) {
    await crearSesion('tesorero')
    return NextResponse.json({ rol: 'tesorero' })
  }
  if (password === process.env.PASSWORD_PRESIDENTE) {
    await crearSesion('presidente')
    return NextResponse.json({ rol: 'presidente' })
  }
  if (password === process.env.PASSWORD_SECRETARIA) {
    await crearSesion('secretaria')
    return NextResponse.json({ rol: 'secretaria' })
  }

  return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
}
