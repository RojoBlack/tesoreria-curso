export type Categoria = 'Cuotas' | 'Materiales' | 'Paseo' | 'Celebración' | 'Otros'

export const CATEGORIAS: Categoria[] = ['Cuotas', 'Materiales', 'Paseo', 'Celebración', 'Otros']

export const MESES_2026 = [
  { key: '2026-03', label: 'Marzo' },
  { key: '2026-04', label: 'Abril' },
  { key: '2026-05', label: 'Mayo' },
  { key: '2026-06', label: 'Junio' },
  { key: '2026-07', label: 'Julio' },
  { key: '2026-08', label: 'Agosto' },
  { key: '2026-09', label: 'Septiembre' },
  { key: '2026-10', label: 'Octubre' },
  { key: '2026-11', label: 'Noviembre' },
  { key: '2026-12', label: 'Diciembre' },
]

export interface Alumno {
  id: string
  nombre: string
  codigo_apoderado: string
  activo: boolean
  created_at: string
}

export interface Movimiento {
  id: string
  fecha: string
  categoria: Categoria
  descripcion: string
  monto: number
  alumno_id: string | null
  mes_cuota: string | null
  created_at: string
  alumnos?: { nombre: string } | null
}

export interface Config {
  [clave: string]: string
}

export function formatCLP(monto: number) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(monto)
}

export function labelMes(key: string) {
  return MESES_2026.find(m => m.key === key)?.label ?? key
}
