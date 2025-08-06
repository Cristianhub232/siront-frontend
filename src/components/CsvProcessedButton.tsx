'use client';

interface CsvProcessedProps {
  onProcess: () => void;
  disabled?: boolean;
}

export default function CsvProcessedButton({ onProcess, disabled = false }: CsvProcessedProps) {
  return (
    <button
      onClick={onProcess}
      disabled={disabled}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 cursor-pointer"
    >
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v16h16V4H4zm8 8v4m0-4H8m4 0h4" />
      </svg>
      Procesar archivo
    </button>
  );
}
