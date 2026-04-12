export type ReunionTipo = 'Ordinaria' | 'Extraordinaria' | 'Emergencia'
export type DecisionEstado = 'Pendiente' | 'En proceso' | 'Cumplida'

export const REUNION_TIPOS: ReunionTipo[] = ['Ordinaria', 'Extraordinaria', 'Emergencia']
export const DECISION_ESTADOS: DecisionEstado[] = ['Pendiente', 'En proceso', 'Cumplida']

export interface Reunion {
  id: string
  fecha: string
  tipo: ReunionTipo
  lugar: string
  hora: string
  asistentes_count: number
  resumen: string
  created_at: string
  actas?: Acta[]
  decisiones?: Decision[]
}

export interface Acta {
  id: string
  reunion_id: string
  contenido: string
  created_at: string
}

export interface Decision {
  id: string
  reunion_id: string | null
  descripcion: string
  responsable: string
  estado: DecisionEstado
  fecha_limite: string | null
  created_at: string
}

export interface Aviso {
  id: string
  titulo: string
  contenido: string
  destacado: boolean
  created_at: string
}
