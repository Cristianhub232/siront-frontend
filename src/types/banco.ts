export interface Banco {
  id: number;
  codigo_banco: string;
  nombre_banco: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBancoRequest {
  codigo_banco: string;
  nombre_banco: string;
}

export interface UpdateBancoRequest {
  codigo_banco?: string;
  nombre_banco?: string;
}

export interface BancoFilters {
  nombre_banco?: string;
  codigo_banco?: string;
}

export interface BancoStats {
  total: number;
  porcentaje_completitud: number;
} 