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
import { IconPlus } from "@tabler/icons-react";

interface AddCodigoPresupuestarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddCodigoPresupuestarioModal({
  open,
  onOpenChange,
  onSuccess,
}: AddCodigoPresupuestarioModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    codigo_presupuestario: "",
    designacion_presupuestario: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.codigo_presupuestario.trim() || !formData.designacion_presupuestario.trim()) {
      toast.error("Todos los campos son requeridos");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/codigos-presupuestarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Código presupuestario agregado exitosamente");
        setFormData({
          codigo_presupuestario: "",
          designacion_presupuestario: "",
        });
        onOpenChange(false);
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al agregar código presupuestario");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al agregar código presupuestario");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconPlus className="h-5 w-5" />
            Agregar Código Presupuestario
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
              {isLoading ? "Agregando..." : "Agregar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 