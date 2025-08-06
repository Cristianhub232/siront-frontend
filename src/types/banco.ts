export interface Banco {
  id: number;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  tipo?: string;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface CreateBancoRequest {
  codigo?: string;
  nombre: string;
  descripcion?: string;
  tipo?: string;
}

export interface UpdateBancoRequest {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  tipo?: string;
}

export interface BancoFilters {
  nombre?: string;
  codigo?: string;
  tipo?: string;
}

export interface BancoStats {
  total: number;
  con_descripcion: number;
  sin_descripcion: number;
  porcentaje_completitud: number;
} 