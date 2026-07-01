export interface PaymentsResumen {
  ventas_totales: number;
  ticket_promedio: number;
  ingresos_mes_actual: number;
  crecimiento_mensual: number;
  pagos_totales: number;
  tasa_aprobacion: number;
  pendientes: number;
  cancelados: number;
  pagos_hoy: number;
  top_propietario: { id: string; ventas: number; monto: number } | null;
  alquiladores_recurrentes: number;
  propietarios_activos: number;
}

export interface VentasTotales {
  ventas_totales: number;
}

export interface TicketPromedio {
  ticket_promedio: number;
}

export interface IngresosMesActual {
  ingresos_mes_actual: number;
  crecimiento_mensual: number;
}

export interface PagosRealizados {
  pagos_totales: number;
}

export interface TasaAprobacion {
  tasa_aprobacion: number;
}

export interface Pendientes {
  pendientes: number;
}

export interface Cancelados {
  cancelados: number;
}

export interface PagosHoy {
  pagos_hoy: number;
}

export interface TopPropietario {
  top_propietario: { id: string; ventas: number; monto: number } | null;
}

export interface AlquiladoresRecurrentes {
  alquiladores_recurrentes: number;
}

export interface PropietariosActivos {
  propietarios_activos: number;
}
