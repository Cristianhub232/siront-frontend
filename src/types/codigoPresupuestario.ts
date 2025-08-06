export interface CodigoPresupuestario {
  id: number;
  codigo_presupuestario: string;
  designacion_presupuestario: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCodigoPresupuestarioRequest {
  codigo_presupuestario: string;
  designacion_presupuestario: string;
}

export interface UpdateCodigoPresupuestarioRequest {
  codigo_presupuestario?: string;
  designacion_presupuestario?: string;
}

export interface CodigoPresupuestarioFilters {
  codigo_presupuestario?: string;
  designacion_presupuestario?: string;
}

export interface CodigoPresupuestarioStats {
  total: number;
  porcentaje_completitud: number;
} 