// ── Resumen global ────────────────────────────────────────
export interface ResumenGlobal {
  total_resenas: number;
  total_aprobadas: number;
  total_rechazadas: number;
  total_pendientes: number;
  tasa_aprobacion: number;
  calificacion_promedio_global: number;
  resenas_con_respuesta: number;
  tasa_respuesta: number;
  resenas_ultima_semana: number;
  resenas_ultimo_mes: number;
}

// ── Tendencia temporal ────────────────────────────────────
export interface TendenciaPunto {
  periodo: string;
  cantidad_resenas: number;
  calificacion_promedio: number;
}

export interface TendenciaData {
  granularidad: string;
  cantidad_periodos: number;
  datos: TendenciaPunto[];
}

// ── Distribución de calificaciones ───────────────────────
export interface DistribucionPunto {
  calificacion: number;
  cantidad: number;
  porcentaje: number;
}

export interface DistribucionData {
  tipo: string;
  distribucion: DistribucionPunto[];
}

// ── Rankings ──────────────────────────────────────────────
export interface RankingItemAlquilador {
  id_alquilador: string;
  calificacion_promedio: number;
  cantidad_resenas: number;
}

export interface RankingItemPropietario {
  id_propietario: string;
  calificacion_promedio: number;
  cantidad_resenas: number;
}

export interface RankingItemVehiculo {
  id_vehiculo: string;
  calificacion_promedio: number;
  cantidad_resenas: number;
}

export interface RankingData<T> {
  tipo: string;
  periodo: string;
  orden: string;
  label: string;
  ranking: T[];
}

// ── Tiempo de moderación ──────────────────────────────────
export interface TiempoModeracionEstado {
  promedio_dias: number;
  mediana_dias: number;
  cantidad: number;
}

export interface TiempoModeracion {
  promedio_dias: number;
  mediana_dias: number;
  percentil_90_dias: number;
  total_moderaciones: number;
  por_estado: Record<string, TiempoModeracionEstado>;
}

// ── Emisores recurrentes ──────────────────────────────────
export interface EmisorRecurrente {
  id_emisor: string;
  cantidad_resenas: number;
  calificacion_promedio_emitida: number;
  ultima_resena: string;
}

export interface EmisoresRecurrentesData {
  parametros: { min_resenas: number };
  total: number;
  emisores: EmisorRecurrente[];
}

// ── Rechazos por emisor ───────────────────────────────────
export interface EmisorRechazo {
  id_emisor: string;
  total_resenas: number;
  resenas_rechazadas: number;
  resenas_pendientes: number;
  tasa_rechazo: number;
}

export interface RechazosEmisorData {
  parametros: { min_resenas: number; umbral_tasa: number };
  total_alertas: number;
  emisores: EmisorRechazo[];
}

// ── Caída de calificación ─────────────────────────────────
export interface CaidaItem {
  id_alquilador?: string;
  id_propietario?: string;
  id_vehiculo?: string;
  promedio_historico: number;
  promedio_reciente: number;
  caida: number;
  resenas_historicas: number;
  resenas_recientes: number;
}

export interface CaidaData {
  tipo: string;
  parametros: {
    dias_reciente: number;
    umbral_caida: number;
    min_resenas_recientes: number;
  };
  total_alertas: number;
  entidades_con_caida: CaidaItem[];
}
