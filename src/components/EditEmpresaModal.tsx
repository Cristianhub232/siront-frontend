"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { EmpresaPetrolera, UpdateEmpresaPetroleraRequest } from "@/types/empresaPetrolera";

interface EditEmpresaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresa: EmpresaPetrolera | null;
  onSave: (empresa: EmpresaPetrolera) => void;
}

export default function EditEmpresaModal({ open, onOpenChange, empresa, onSave }: EditEmpresaModalProps) {
  const [formData, setFormData] = useState<UpdateEmpresaPetroleraRequest>({
    id: 0,
    nombre_empresa: "",
    rif: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (empresa) {
      setFormData({
        id: empresa.id,
        nombre_empresa: empresa.nombre_empresa || "",
        rif: empresa.rif || ""
      });
    }
  }, [empresa]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre_empresa?.trim()) {
      toast.error("El nombre de la empresa es requerido");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/empresas-petroleras/${formData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error actualizando empresa");
      }

      const updatedEmpresa = await response.json();
      toast.success("Empresa petrolera actualizada exitosamente");
      onSave(updatedEmpresa);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Error actualizando empresa petrolera");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof UpdateEmpresaPetroleraRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!empresa) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Empresa Petrolera</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre_empresa">Nombre de la Empresa *</Label>
            <Input
              id="nombre_empresa"
              value={formData.nombre_empresa}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("nombre_empresa", e.target.value)}
              placeholder="Nombre de la empresa petrolera"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rif">RIF</Label>
            <Input
              id="rif"
              value={formData.rif}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("rif", e.target.value)}
              placeholder="RIF de la empresa"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Actualizando..." : "Actualizar Empresa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 