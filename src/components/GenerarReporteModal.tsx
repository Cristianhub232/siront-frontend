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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { CreateReporteRequest } from "@/types/reporteCierre";

interface GenerarReporteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  codigoPresupuestario?: string;
  selectedYear?: string;
  onSuccess: () => void;
}

export default function GenerarReporteModal({ 
  open, 
  onOpenChange, 
  codigoPresupuestario = "",
  selectedYear = "2024",
  onSuccess 
}: GenerarReporteModalProps) {
  const [formData, setFormData] = useState<CreateReporteRequest>({
    codigo_presupuestario: codigoPresupuestario,
    periodo_inicio: "",
    periodo_fin: "",
    titulo: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [codigosDisponibles, setCodigosDisponibles] = useState<Array<{codigo: string, designacion: string}>>([]);

  // Cargar códigos presupuestarios disponibles
  useEffect(() => {
    const fetchCodigos = async () => {
      try {
        const response = await fetch('/api/reportes-cierre');
        if (response.ok) {
                  const data = await response.json();
        const codigos = data.resumen?.map((item: any) => ({
          codigo: item.codigo_presupuestario,
          designacion: item.designacion_presupuestario
        })) || [];
        setCodigosDisponibles(codigos);
        }
      } catch (error) {
        console.error('Error cargando códigos:', error);
      }
    };

    if (open) {
      fetchCodigos();
    }
  }, [open]);

  // Actualizar código presupuestario cuando cambie la prop
  useEffect(() => {
    if (codigoPresupuestario) {
      setFormData(prev => ({
        ...prev,
        codigo_presupuestario: codigoPresupuestario
      }));
    }
  }, [codigoPresupuestario]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.codigo_presupuestario.trim()) {
      toast.error("El código presupuestario es requerido");
      return;
    }

    if (!formData.periodo_inicio || !formData.periodo_fin) {
      toast.error("Las fechas de período son requeridas");
      return;
    }

    if (new Date(formData.periodo_inicio) > new Date(formData.periodo_fin)) {
      toast.error("La fecha de inicio no puede ser mayor a la fecha fin");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/reportes-cierre", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error generando reporte");
      }

      const reporte = await response.json();
      
      // Aquí se generaría el PDF (implementación futura)
      toast.success("Reporte generado exitosamente");
      
      // Simular descarga del PDF
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(
          `Reporte de Cierre - ${reporte.codigo_presupuestario}\n` +
          `Período: ${reporte.periodo_inicio} - ${reporte.periodo_fin}\n` +
          `Total Monto: ${new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(reporte.total_monto)}\n` +
          `Cantidad Conceptos: ${reporte.cantidad_conceptos}\n` +
          `Fecha Generación: ${new Date(reporte.fecha_generacion).toLocaleDateString('es-VE')}`
        )}`;
        link.download = `reporte-cierre-${reporte.codigo_presupuestario}-${new Date().toISOString().split('T')[0]}.txt`;
        link.click();
      }, 1000);

      onSuccess();
      onOpenChange(false);
      setFormData({
        codigo_presupuestario: codigoPresupuestario,
        periodo_inicio: "",
        periodo_fin: "",
        titulo: ""
      });
    } catch (error: any) {
      toast.error(error.message || "Error generando reporte");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof CreateReporteRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRefreshMaterializedView = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/reportes-cierre/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Vista materializada actualizada en ${data.executionTime}ms`);
        // Recargar los códigos disponibles después de la actualización
        const codigosResponse = await fetch('/api/reportes-cierre');
        if (codigosResponse.ok) {
          const codigosData = await codigosResponse.json();
          const codigos = codigosData.resumen?.map((item: any) => ({
            codigo: item.codigo_presupuestario,
            designacion: item.designacion_presupuestario
          })) || [];
          setCodigosDisponibles(codigos);
        }
      } else {
        toast.error('Error actualizando vista materializada');
      }
    } catch (error) {
      console.error('Error actualizando vista materializada:', error);
      toast.error('Error actualizando vista materializada');
    } finally {
      setIsRefreshing(false);
    }
  };

  const generarTituloAutomatico = () => {
    if (formData.codigo_presupuestario && formData.periodo_inicio && formData.periodo_fin) {
      const titulo = `Reporte de Cierre - ${formData.codigo_presupuestario} (${formData.periodo_inicio} - ${formData.periodo_fin})`;
      setFormData(prev => ({ ...prev, titulo }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generar Reporte de Cierre</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="codigo_presupuestario">Código Presupuestario *</Label>
            <Select
              value={formData.codigo_presupuestario}
              onValueChange={(value) => handleChange("codigo_presupuestario", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar código presupuestario" />
              </SelectTrigger>
              <SelectContent>
                {codigosDisponibles.map((item) => (
                  <SelectItem key={item.codigo} value={item.codigo}>
                    {item.codigo} - {item.designacion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periodo_inicio">Fecha Inicio *</Label>
              <Input
                id="periodo_inicio"
                type="date"
                value={formData.periodo_inicio}
                onChange={(e) => handleChange("periodo_inicio", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodo_fin">Fecha Fin *</Label>
              <Input
                id="periodo_fin"
                type="date"
                value={formData.periodo_fin}
                onChange={(e) => handleChange("periodo_fin", e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="titulo">Título del Reporte</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generarTituloAutomatico}
              >
                Generar Automático
              </Button>
            </div>
            <Textarea
              id="titulo"
              placeholder="Título personalizado del reporte..."
              value={formData.titulo}
              onChange={(e) => handleChange("titulo", e.target.value)}
              rows={2}
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Información del Reporte</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Se generará un reporte PDF con los conceptos del período seleccionado</li>
              <li>• Incluirá totales, promedios y estadísticas detalladas</li>
              <li>• El reporte se descargará automáticamente</li>
            </ul>
          </div>

          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-orange-900">Vista Materializada</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRefreshMaterializedView}
                disabled={isRefreshing}
                className="text-orange-700 border-orange-300 hover:bg-orange-100"
              >
                {isRefreshing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-orange-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Actualizando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Actualizar Datos
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-orange-700">
              Los datos se obtienen de una vista materializada optimizada para mejor rendimiento. 
              Si necesitas datos más recientes, actualiza la vista materializada.
            </p>
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
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading ? "Generando..." : "Generar Reporte PDF"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 