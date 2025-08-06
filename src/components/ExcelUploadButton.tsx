'use client';

import readXlsxFile from 'read-excel-file';
import { ChangeEvent } from 'react';
import { sanitizeCsvData } from '@/lib/sanitizeCsvData';
import { CsvRow } from '@/types/index';

export function ExcelUploadButton({
  onDataLoaded,
}: {
  onDataLoaded: (data: CsvRow[]) => void;
}) {
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const rows: unknown[][] = await readXlsxFile(file);

      const [header, ...rest] = rows;

      if (!header || !Array.isArray(header)) {
        alert("Archivo no válido. Asegúrese de que tenga encabezados.");
        return;
      }

      // Convertir a array de objetos
      const rawObjects: CsvRow[] = rest.map((row) => {
        const obj: CsvRow = {};
        row.forEach((cell, i) => {
          const key = String(header[i]).trim();
          obj[key] = String(cell ?? '');
        });
        return obj;
      });

      const sanitized = sanitizeCsvData(rawObjects);
      onDataLoaded(sanitized);
    } catch (error) {
      console.error("Error al leer el archivo Excel:", error);
      alert("Hubo un error al leer el archivo Excel.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <label className="block">
        <span className="sr-only">Subir archivo Excel</span>
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
        />
      </label>
    </div>
  );
}
