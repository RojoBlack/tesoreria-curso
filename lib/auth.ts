import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(process.env.SESSION_SECRET!)
const COOKIE = 'tesoreria_session'

export type Rol = 'presidente' | 'tesorero' | 'secretaria'

export async function crearSesion(rol: Rol) {
  const token = await new SignJWT({ rol })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('8h')
    .sign(secret)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })
}

export async function obtenerSesion(): Promise<Rol | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE)?.value
    if (!token) return null
    const { payload } = await jwtVerify(token, secret)
    return (payload.rol as Rol) ?? null
  } catch {
    return null
  }
}

export async function cerrarSesion() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE)
}

export async function requiereRol(rol: Rol): Promise<boolean> {
  const sesion = await obtenerSesion()
  if (!sesion) return false
  if (rol === 'presidente') return ['presidente', 'tesorero'].includes(sesion)
  if (rol === 'secretaria') return ['secretaria', 'tesorero', 'presidente'].includes(sesion)
  return sesion === 'tesorero'
}
