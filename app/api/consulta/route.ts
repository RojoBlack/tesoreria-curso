import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { MESES_2026 } from '@/lib/types'

export async function GET(req: NextRequest) {
  const codigo = req.nextUrl.searchParams.get('codigo')?.toUpperCase()

  if (!codigo) {
    return NextResponse.json({ error: 'Código requerido' }, { status: 400 })
  }

  const { data: alumno, error } = await supabase
    .from('alumnos')
    .select('id, nombre')
    .eq('codigo_apoderado', codigo)
    .eq('activo', true)
    .single()

  if (error || !alumno) {
    return NextResponse.json({ error: 'Código no encontrado. Verifica que esté escrito correctamente.' }, { status: 404 })
  }

  const { data: configRows } = await supabase
    .from('config')
    .select('clave, valor')
    .in('clave', ['cuota_mensual'])

  const cuotaMensual = parseInt(configRows?.find(r => r.clave === 'cuota_mensual')?.valor ?? '2000', 10)

  const { data: pagos } = await supabase
    .from('movimientos')
    .select('mes_cuota, fecha, monto')
    .eq('alumno_id', alumno.id)
    .eq('categoria', 'Cuotas')
    .gt('monto', 0)

  const mesesPagados = new Map<string, string>()
  let saldoAFavor = 0

  for (const pago of pagos ?? []) {
    if (pago.mes_cuota) {
      mesesPagados.set(pago.mes_cuota, pago.fecha)
    } else {
      saldoAFavor += pago.monto
    }
  }

  // Determinar el mes parcial: primer mes no pagado donde aplica el saldo a favor
  const primerMesSinPagar = MESES_2026.find(m => !mesesPagados.has(m.key))
  const mesParcial = saldoAFavor > 0 && primerMesSinPagar ? primerMesSinPagar.key : null

  const cuotas = MESES_2026.map(({ key, label }) => ({
    mes: key,
    label,
    pagado: mesesPagados.has(key),
    fecha: mesesPagados.get(key),
    parcial: key === mesParcial ? saldoAFavor : 0,
  }))

  const mesesPagadosCount = mesesPagados.size
  const totalPagado = mesesPagadosCount * cuotaMensual + saldoAFavor
  const totalPendiente = Math.max(0, (MESES_2026.length - mesesPagadosCount) * cuotaMensual - saldoAFavor)

  return NextResponse.json({
    nombre: alumno.nombre,
    cuotaMensual,
    totalPagado,
    totalPendiente,
    mesesPagados: mesesPagadosCount,
    cuotas,
  })
}