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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Forma, UpdateFormaRequest } from "@/types/forma";

interface EditFormaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  forma: Forma | null;
  onSave: (updated: Forma) => void;
}

export default function EditFormaModal({ open, onOpenChange, forma, onSave }: EditFormaModalProps) {
  const [formData, setFormData] = useState<UpdateFormaRequest>({
    id: 0,
    nombre_forma: "",
    codigo_forma: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (forma) {
      setFormData({
        id: forma.id,
        nombre_forma: forma.nombre_forma || "",
        codigo_forma: forma.codigo_forma || ""
      });
    }
  }, [forma]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre_forma?.trim()) {
      toast.error("El nombre de la forma es requerido");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/formas/${formData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error actualizando forma");
      }

      const updatedForma = await response.json();
      toast.success("Forma actualizada exitosamente");
      onSave(updatedForma);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Error actualizando forma");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof UpdateFormaRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!forma) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Forma</DialogTitle>
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
              {isLoading ? "Actualizando..." : "Actualizar Forma"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 