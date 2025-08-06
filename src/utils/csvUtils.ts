
export async function handleCsvUpload(file: File): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload-csv', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error al procesar el archivo CSV');
    }

    const data = await response.json();
    localStorage.setItem('csvData', JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error al procesar el archivo CSV:', error);
    return false;
  }
}

export function validateCsvFile(file: File): boolean {
  // Verificar la extensión del archivo
  if (!file.name.endsWith('.csv')) {
    return false;
  }

  // Verificar el tamaño del archivo (máximo 25MB)
  const maxSize = 25 * 1024 * 1024; // 25MB en bytes
  if (file.size > maxSize) {
    return false;
  }

  return true;
}

export type CsvRow = Record<string, string>;

export function parseCsvData(csvText: string): CsvRow[] {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(value => value.trim());
    const row: CsvRow = {} as CsvRow;
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    return row;
  });
}

/**
 * Limpia un array de objetos (resultado de PapaParse) y deja solo los campos permitidos.
 * Si falta un valor o una columna, se rellena con "Por Asignar".
 */
export function sanitizeCSVData(rawData: CsvRow[]): CsvRow[] {
  const CAMPOS_PERMITIDOS = [
    'Rif',
    'Contribuyente',
    'Region De Procedencia',
    'Dependencia Nueva',
    'Procedencia',
  ];

  // Mapeo para búsqueda case-insensitive

  return rawData.map((row) => {
    const nuevaFila: Record<string, string> = {};

    for (let i = 0; i < CAMPOS_PERMITIDOS.length; i++) {
      const nombreCampo = CAMPOS_PERMITIDOS[i]; // Ej: "Rif"
      const nombreNormalizado = nombreCampo.trim().toUpperCase();

      // Buscar clave real en la fila
      const claveReal = Object.keys(row).find(
        (key) => key === nombreNormalizado
      );

      const valor = claveReal ? row[claveReal]?.trim() : '';
      nuevaFila[nombreCampo] = valor || 'Por Asignar';
    }

    return nuevaFila;
  });
}
