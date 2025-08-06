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
import type { Banco, UpdateBancoRequest } from "@/types/banco";

interface EditBancoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banco: Banco | null;
  onSave: (banco: Banco) => void;
}

export default function EditBancoModal({ open, onOpenChange, banco, onSave }: EditBancoModalProps) {
  const [formData, setFormData] = useState<UpdateBancoRequest>({
    codigo_banco: "",
    nombre_banco: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (banco) {
      setFormData({
        codigo_banco: banco.codigo_banco || "",
        nombre_banco: banco.nombre_banco || ""
      });
    }
  }, [banco]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre_banco?.trim()) {
      toast.error("El nombre del banco es requerido");
      return;
    }

    if (!formData.codigo_banco?.trim()) {
      toast.error("El código del banco es requerido");
      return;
    }

    if (!banco) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/bancos/${banco.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error actualizando banco");
      }

      const updatedBanco = await response.json();
      toast.success("Banco actualizado exitosamente");
      onSave(updatedBanco);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Error actualizando banco");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof UpdateBancoRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!banco) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Banco</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="codigo_banco">Código del Banco *</Label>
            <Input
              id="codigo_banco"
              value={formData.codigo_banco}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("codigo_banco", e.target.value)}
              placeholder="Ej: 001"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nombre_banco">Nombre del Banco *</Label>
            <Input
              id="nombre_banco"
              value={formData.nombre_banco}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("nombre_banco", e.target.value)}
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
              {isLoading ? "Actualizando..." : "Actualizar Banco"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 