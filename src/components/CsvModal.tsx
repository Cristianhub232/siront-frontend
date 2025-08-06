'use client';

import { useState, useRef } from 'react';


type CsvRow = Record<string, string>;

interface CsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (data: CsvRow[]) => void;
}

export function CsvModal({ isOpen, onClose, onDataLoaded }: CsvModalProps) {
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
    if (file) {
      await processFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Por favor, seleccione un archivo CSV válido');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/procesar_csv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al procesar el archivo CSV');
      }

      const data = await response.json();
      console.log('Llamando a onDataLoaded desde CsvModal con:', data); // Debug: verificar llamada
      onDataLoaded(data);                 // ✅ pasa directo a la tabla
      onClose();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div
          className="relative transform overflow-hidden rounded-lg bg-white  text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white  px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                  Cargar Archivo CSV
                </h3>

                <div
                  className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center ${
                    isDragging
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv"
                    className="hidden"
                    disabled={isLoading}
                  />

                  <div className="space-y-4">
                    <svg
                      className={`mx-auto h-12 w-12 ${
                        isDragging
                          ? 'text-red-500'
                          : 'text-gray-400'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>

                    <div className="text-sm text-gray-600 ">
                      <p className="font-medium">
                        {isDragging ? 'Suelte el archivo aquí' : 'Arrastre y suelte su archivo CSV aquí'}
                      </p>
                      <p className="mt-1">o</p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Seleccionar archivo
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-sm text-gray-500 ">
                  <h3 className="font-medium mb-2">Instrucciones:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>El archivo debe estar en formato CSV</li>
                    <li>La primera fila debe contener los encabezados</li>
                    <li>Los datos deben estar separados por comas</li>
                    <li>El archivo no debe exceder los 5MB</li>
                  </ul>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-50  border border-red-200  rounded-lg">
                    <p className="text-sm text-red-600 ">{error}</p>
                  </div>
                )}

                {isLoading && (
                  <div className="mt-4 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-2 text-sm text-gray-600 ">Procesando archivo...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50  px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white  px-3 py-2 text-sm font-semibold text-gray-900  shadow-sm ring-1 ring-inset ring-gray-300  hover:bg-gray-50  sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CsvUploadButton({ onDataLoaded }: { onDataLoaded: (data: CsvRow[]) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center justify-center space-x-2 px-4 py-2 border-2 border-red-300 
           text-red-500  rounded-lg hover:bg-red-50 
           transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <span>Cargar archivo CSV</span>
      </button>
      <CsvModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onDataLoaded={onDataLoaded} 
      />
    </>
  );
} 