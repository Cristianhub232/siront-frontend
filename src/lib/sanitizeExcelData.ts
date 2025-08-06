import { CsvRow } from '@/types/index';

export const ENCABEZADOS_VALIDOS: Record<string, string> = {
  'rif': 'Rif',
  'rif (pegar aquí)': 'Rif',
  'rif\n(pegar aquí)': 'Rif',

  'nombre contribuyente': 'Contribuyente',
  'nombre  contribuyente': 'Contribuyente',

  'region': 'Region De Procedencia',
  'región': 'Region De Procedencia',

  'unidad de adscripción de destino': 'Dependencia Nueva',
  'unidad de adscripcion de destino': 'Dependencia Nueva',

  'observaciones': 'observaciones',
  'procedencia': 'Procedencia',
};

export const CAMPOS_PERMITIDOS = Object.values(ENCABEZADOS_VALIDOS);

function normalizarClave(clave: string): string {
  return clave.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function sanitizeExcelData(rawData: CsvRow[]): CsvRow[] {
  return rawData.map((row) => {
    const nuevaFila: CsvRow = {};

    for (const key of Object.keys(row)) {
      const valor = row[key]?.trim() || 'Por Asignar';
      const claveNorm = normalizarClave(key);
      const campoFinal = ENCABEZADOS_VALIDOS[claveNorm];

      if (campoFinal) {
        nuevaFila[campoFinal] = valor;
      }
    }

    for (const campo of CAMPOS_PERMITIDOS) {
      if (!(campo in nuevaFila)) {
        nuevaFila[campo] = 'Por Asignar';
      }
    }

    return nuevaFila;
  });
}
