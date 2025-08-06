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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { CreateFormaRequest } from "@/types/forma";

interface AddFormaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddFormaModal({ open, onOpenChange, onSuccess }: AddFormaModalProps) {
  const [formData, setFormData] = useState<CreateFormaRequest>({
    nombre_forma: "",
    codigo_forma: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre_forma.trim()) {
      toast.error("El nombre de la forma es requerido");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/formas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error creando forma");
      }

      toast.success("Forma creada exitosamente");
      onSuccess();
      onOpenChange(false);
      setFormData({
        nombre_forma: "",
        codigo_forma: ""
      });
    } catch (error: any) {
      toast.error(error.message || "Error creando forma");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof CreateFormaRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Nueva Forma</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre_forma">Nombre de la Forma *</Label>
            <Input
              id="nombre_forma"
              placeholder="Ingrese el nombre de la forma"
              value={formData.nombre_forma}
              onChange={(e) => handleChange("nombre_forma", e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="codigo_forma">Código de la Forma *</Label>
            <Input
              id="codigo_forma"
              placeholder="Ingrese el código de la forma"
              value={formData.codigo_forma}
              onChange={(e) => handleChange("codigo_forma", e.target.value)}
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
              {isLoading ? "Creando..." : "Crear Forma"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 