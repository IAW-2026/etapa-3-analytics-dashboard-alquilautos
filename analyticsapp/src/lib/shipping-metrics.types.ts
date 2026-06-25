export interface DistribucionSemanal {
  day: string;
  entregas: number;
  devoluciones: number;
}

export interface EstadosShipping {
  entregasActivas: number;
  pendientesCoordinar: number;
  devoluciones: number;
  canceladas: number;
}

export interface VariacionEstadosShipping {
  current: number;
  previous: number;
  variation: number;
}

export interface EstadoDistribucionShipping {
  name: string;
  value: number;
  color: string;
}
