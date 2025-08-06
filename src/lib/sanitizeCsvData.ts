export type CsvRow = Record<string, string>;

export const CAMPOS_PERMITIDOS = [
  'Rif',
  'Contribuyente',
  'Region De Procedencia',
  'Dependencia Nueva',
  'observaciones',
  'Procedencia',
];

/**
 * Normaliza claves para comparación flexible:
 * - elimina espacios extra
 * - pasa a minúsculas
 */
function normalizarClave(clave: string): string {
  return clave.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Sanitiza un conjunto de datos (formato CSV) asegurando que solo se tomen los campos permitidos
 * y se normalicen claves inconsistentes.
 */
export function sanitizeCsvData(rawData: CsvRow[]): CsvRow[] {
  return rawData.map((row) => {
    const nuevaFila: CsvRow = {};

    for (const campo of CAMPOS_PERMITIDOS) {
      const campoNormalizado = normalizarClave(campo);

      const claveReal = Object.keys(row).find((key) =>
        normalizarClave(key) === campoNormalizado
      );

      const valor = claveReal ? row[claveReal]?.trim() : '';
      console.log(row);
      nuevaFila[campo] = valor || 'Por Asignar';
    }

    return nuevaFila;
  });
}
