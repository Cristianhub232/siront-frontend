"use client";

import { useState } from "react";
import { FileModal } from "./FileModal";
import { CsvRow } from "@/types/index";

interface FileUploadButtonProps {
  onDataLoaded: (data: CsvRow[]) => void;
}

export function FileUploadButton({ onDataLoaded }: FileUploadButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-red-300 
           text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors 
           disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <span>Cargar archivo</span>
      </button>

      <FileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDataLoaded={(data) => {
          onDataLoaded(data); // Propaga los datos sanitizados
          setIsModalOpen(false); // Cierra el modal automáticamente
        }}
      />
    </>
  );
}
