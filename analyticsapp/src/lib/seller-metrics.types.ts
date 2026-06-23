export type EstadoReserva =
  | "Pendiente" | "Aceptada" | "Rechazada" | "Coordinada"
  | "Pagada" | "Entregada" | "Finalizada" | "Cancelada";

export type ResumenGeneral = {
  total_propietarios: number;
  vehiculos: { total: number; disponibles: number; alquilados: number };
  reservas: { total: number; por_estado: Record<EstadoReserva, number> };
  ingresos_totales_ars: number;
};

export type VehiculoTop = {
  id_vehiculo: string;
  marca: string;
  modelo: string;
  anio: number;
  id_propietario: string;
  cantidad_alquileres: number;
  ingresos_generados: number;
  propietario: { nombre: string; apellido: string };
};

export type PropietarioTop = {
  id_propietario: string;
  nombre: string;
  apellido: string;
  email: string;
  cantidad_vehiculos: number;
  cantidad_reservas_finalizadas: number;
  ingresos_totales: number;
};

export type IngresoPeriodo = {
  periodo: string;
  ingresos: number;
  cantidad_reservas: number;
};

export type TasaConversion = {
  total_reservas: number;
  finalizadas: number;
  canceladas: number;
  tasa_conversion: number;
  tasa_cancelacion: number;
  tiempo_promedio_ciclo_dias: number;
};

export type OcupacionVehiculos = {
  ocupacion_promedio_plataforma: number;
  vehiculos: {
    id_vehiculo: string;
    marca: string;
    modelo: string;
    dias_alquilados: number;
    dias_totales: number;
    porcentaje: number;
  }[];
};

export type DistribucionMarca = {
  marca: string;
  cantidad_vehiculos: number;
  cantidad_reservas_finalizadas: number;
  ingresos_totales: number;
};

export type ActividadRecienteData = {
  ultimas_reservas: {
    id_reserva: string;
    estado: EstadoReserva;
    id_propietario: string;
    vehiculo: string;
    createdAt: string;
  }[];
  nuevos_propietarios: {
    id_propietario: string;
    nombre: string;
    apellido: string;
    email: string;
    createdAt: string;
  }[];
  pendientes_vencidos: {
    id_reserva: string;
    id_propietario: string;
    vehiculo: string;
    createdAt: string;
  }[];
};