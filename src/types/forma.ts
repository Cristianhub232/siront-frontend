export interface Forma {
  id: number;
  nombre_forma: string;
  codigo_forma: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateFormaRequest {
  nombre_forma: string;
  codigo_forma: string;
}

export interface UpdateFormaRequest {
  id: number;
  nombre_forma: string;
  codigo_forma: string;
} 