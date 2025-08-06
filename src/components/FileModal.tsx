"use client";

import { useState, useRef } from "react";
import readXlsxFile from "read-excel-file";
import { CsvRow } from "@/types/index";
import { sanitizeExcelData } from '@/lib/sanitizeExcelData';
import { sanitizeCsvData } from "@/lib/sanitizeCsvData";

interface FileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (data: CsvRow[]) => void;
}

export function FileModal({ isOpen, onClose, onDataLoaded }: FileModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) await processFile(file);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  const processFile = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      if (file.name.endsWith(".csv")) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/procesar_csv", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Error al procesar el archivo CSV");
        }

        const rawData: CsvRow[] = await response.json();
        const sanitized = sanitizeCsvData(rawData);
        onDataLoaded(sanitized);
        onClose();
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        const rows = await readXlsxFile(file);

        const sliced = rows.slice(4); // omitir encabezados decorativos
        const [header, ...rest] = sliced;

        const rawObjects: CsvRow[] = rest.map((row) => {
          const obj: CsvRow = {};
          row.forEach((cell, i) => {
            const key = String(header[i]).trim();
            obj[key] = String(cell ?? "");
          });
          return obj;
        });

        const sanitized = sanitizeExcelData(rawObjects);
        onDataLoaded(sanitized);
        onClose();
      } else {
        throw new Error(
          "Formato no soportado. Solo se permiten CSV o Excel (.xlsx)"
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />

        <div
          className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl sm:my-8 sm:w-full sm:max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="text-left w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Cargar archivo (.csv o .xlsx)
              </h3>

              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center ${isDragging ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv,.xlsx"
                  className="hidden"
                  disabled={isLoading}
                />

                <div className="space-y-4">
                  <p className="font-medium whitespace-pre-wrap">
                    {isDragging
                      ? "Suelte el archivo aquí"
                      : "Arrastre su archivo aquí \n o "}
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className=" inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded cursor-pointer"
                  >
                    Seleccionar archivo
                  </button>
                </div>
              </div>

              <div className="mt-6 text-sm text-gray-500">
                <h4 className="font-medium mb-2">Instrucciones:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Se aceptan archivos CSV o Excel (.xlsx)</li>
                  <li>La primera fila debe contener encabezados</li>
                  <li>Solo se procesan columnas válidas</li>
                  <li>Tamaño máximo recomendado: 5MB</li>
                </ul>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">
                  {error}
                </div>
              )}

              {isLoading && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                  <svg
                    className="animate-spin h-5 w-5 text-red-600"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0..."
                    />
                  </svg>
                  Procesando archivo...
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="mt-3 inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 hover:bg-gray-100 sm:mt-0 sm:w-auto cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
