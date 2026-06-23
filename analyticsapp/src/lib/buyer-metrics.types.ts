export interface TotalAlquiladores {
  total: number;
}

export interface NuevosPorMes {
  meses: { mes: string; total: number }[];
}

export interface Onboarding {
  completo: number;
  pendiente: number;
}

export interface DistribucionEdad {
  menores_de_25: number;
  entre_25_y_40: number;
  mayores_de_40: number;
  sin_datos: number;
}

export interface TotalFavoritos {
  total: number;
}

export interface VehiculoFavoriteado {
  id_vehiculo: string;
  nombre: string;
  cantidad: number;
}

export interface MasFavoriteados {
  vehiculos: VehiculoFavoriteado[];
}

export interface FavoritosPorUsuario {
  con_favoritos: number;
  sin_favoritos: number;
}

export interface PromedioFavoritos {
  promedio: number;
  usuarios_con_favoritos: number;
}
