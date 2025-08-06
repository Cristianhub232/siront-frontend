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
import type { CreateBancoRequest } from "@/types/banco";

interface AddBancoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddBancoModal({ open, onOpenChange, onSuccess }: AddBancoModalProps) {
  const [formData, setFormData] = useState<CreateBancoRequest>({
    codigo_banco: "",
    nombre_banco: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre_banco.trim()) {
      toast.error("El nombre del banco es requerido");
      return;
    }

    if (!formData.codigo_banco.trim()) {
      toast.error("El código del banco es requerido");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/bancos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error creando banco");
      }

      toast.success("Banco creado exitosamente");
      onSuccess();
      onOpenChange(false);
      setFormData({
        codigo_banco: "",
        nombre_banco: ""
      });
    } catch (error: any) {
      toast.error(error.message || "Error creando banco");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof CreateBancoRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar Banco</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="codigo_banco">Código del Banco *</Label>
            <Input
              id="codigo_banco"
              value={formData.codigo_banco}
              onChange={(e) => handleChange("codigo_banco", e.target.value)}
              placeholder="Ej: 001"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nombre_banco">Nombre del Banco *</Label>
            <Input
              id="nombre_banco"
              value={formData.nombre_banco}
              onChange={(e) => handleChange("nombre_banco", e.target.value)}
              placeholder="Nombre del banco"
              required
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
              {isLoading ? "Creando..." : "Crear Banco"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 