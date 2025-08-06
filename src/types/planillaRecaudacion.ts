export interface PlanillaRecaudacion {
  rif_contribuyente: string;
  cod_seg_planilla: string;
  fecha_trans: Date;
  monto_total_trans: number;
  nombre_banco: string;
  codigo_banco: string;
  monto_concepto: number;
  codigo_presupuestario: string;
  designacion_presupuestario: string;
}

export interface PlanillaRecaudacionFilters {
  rif_contribuyente?: string;
  cod_seg_planilla?: string;
  nombre_banco?: string;
  codigo_banco?: string;
  codigo_presupuestario?: string;
  designacion_presupuestario?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  monto_minimo?: number;
  monto_maximo?: number;
}

export interface PlanillaRecaudacionStats {
  total_planillas: number;
  monto_total: number;
  promedio_monto: number;
  bancos_unicos: number;
  contribuyentes_unicos: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
} 