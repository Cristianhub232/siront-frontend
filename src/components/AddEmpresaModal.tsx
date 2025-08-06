"use client";

import React, { useState } from "react";
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
import type { CreateEmpresaPetroleraRequest } from "@/types/empresaPetrolera";

interface AddEmpresaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddEmpresaModal({ open, onOpenChange, onSuccess }: AddEmpresaModalProps) {
  const [formData, setFormData] = useState<CreateEmpresaPetroleraRequest>({
    nombre_empresa: "",
    rif: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre_empresa.trim()) {
      toast.error("El nombre de la empresa es requerido");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/empresas-petroleras", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error creando empresa");
      }

      toast.success("Empresa petrolera creada exitosamente");
      onSuccess();
      onOpenChange(false);
      setFormData({
        nombre_empresa: "",
        rif: ""
      });
    } catch (error: any) {
      toast.error(error.message || "Error creando empresa petrolera");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof CreateEmpresaPetroleraRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar Empresa Petrolera</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre_empresa">Nombre de la Empresa *</Label>
            <Input
              id="nombre_empresa"
              value={formData.nombre_empresa}
              onChange={(e) => handleChange("nombre_empresa", e.target.value)}
              placeholder="Nombre de la empresa petrolera"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rif">RIF</Label>
            <Input
              id="rif"
              value={formData.rif}
              onChange={(e) => handleChange("rif", e.target.value)}
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
              {isLoading ? "Creando..." : "Crear Empresa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 