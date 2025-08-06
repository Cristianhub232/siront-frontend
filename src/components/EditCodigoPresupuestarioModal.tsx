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
import { IconEdit } from "@tabler/icons-react";
import { CodigoPresupuestario } from "@/types/codigoPresupuestario";

interface EditCodigoPresupuestarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  codigo: CodigoPresupuestario | null;
  onSave: (updated: CodigoPresupuestario) => void;
}

export default function EditCodigoPresupuestarioModal({
  open,
  onOpenChange,
  codigo,
  onSave,
}: EditCodigoPresupuestarioModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    codigo_presupuestario: "",
    designacion_presupuestario: "",
  });

  useEffect(() => {
    if (codigo) {
      setFormData({
        codigo_presupuestario: codigo.codigo_presupuestario,
        designacion_presupuestario: codigo.designacion_presupuestario,
      });
    }
  }, [codigo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!codigo) return;
    
    if (!formData.codigo_presupuestario.trim() || !formData.designacion_presupuestario.trim()) {
      toast.error("Todos los campos son requeridos");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/codigos-presupuestarios/${codigo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedCodigo = await response.json();
        toast.success("Código presupuestario actualizado exitosamente");
        onSave(updatedCodigo);
        onOpenChange(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al actualizar código presupuestario");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar código presupuestario");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!codigo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconEdit className="h-5 w-5" />
            Editar Código Presupuestario
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="codigo_presupuestario">Código Presupuestario</Label>
            <Input
              id="codigo_presupuestario"
              name="codigo_presupuestario"
              value={formData.codigo_presupuestario}
              onChange={handleInputChange}
              placeholder="Ej: 301010200"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="designacion_presupuestario">Designación Presupuestaria</Label>
            <Input
              id="designacion_presupuestario"
              name="designacion_presupuestario"
              value={formData.designacion_presupuestario}
              onChange={handleInputChange}
              placeholder="Ej: Impuesto Sobre La Renta a Personas Naturales"
              required
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 