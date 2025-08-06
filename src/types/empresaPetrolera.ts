export interface EmpresaPetrolera {
  id: number;
  numero: number;
  nombre_empresa: string;
  rif?: string;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface CreateEmpresaPetroleraRequest {
  nombre_empresa: string;
  rif?: string;
}

export interface UpdateEmpresaPetroleraRequest extends Partial<CreateEmpresaPetroleraRequest> {
  id: number;
} 