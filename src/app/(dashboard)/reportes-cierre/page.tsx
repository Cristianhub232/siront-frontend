"use client";

import React, { useEffect, useState } from "react";
import {
  Table, TableHeader, TableRow, TableCell, TableBody,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { SkeletonTable } from "@/components/skeletons/tables/Table";
import ConfirmDialog from "@/components/ConfirmDialog";
import GenerarReporteModal from "@/components/GenerarReporteModal";
import type { ReporteResumen, EstadisticasReporte, CreateReporteRequest } from "@/types/reporteCierre";

export default function ReportesCierrePage() {
  const [resumen2024, setResumen2024] = useState<ReporteResumen[]>([]);
  const [resumen2025, setResumen2025] = useState<ReporteResumen[]>([]);
  const [estadisticas2024, setEstadisticas2024] = useState<EstadisticasReporte | null>(null);
  const [estadisticas2025, setEstadisticas2025] = useState<EstadisticasReporte | null>(null);
  const [isLoading2024, setIsLoading2024] = useState(true);
  const [isLoading2025, setIsLoading2025] = useState(true);
  const [openGenerar, setOpenGenerar] = useState(false);
  const [selectedYear, setSelectedYear] = useState("2024");
  
  // Filtros de búsqueda
  const [filtroCodigo, setFiltroCodigo] = useState("");
  const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
  const [filtroFechaFin, setFiltroFechaFin] = useState("");

  const fetchData = async (year: string) => {
    try {
      const isLoading = year === "2024" ? setIsLoading2024 : setIsLoading2025;
      isLoading(true);
      
      // Construir URL con parámetros de búsqueda
      const params = new URLSearchParams();
      if (filtroCodigo) params.append('codigo_presupuestario', filtroCodigo);
      if (filtroFechaInicio) params.append('fecha_inicio', filtroFechaInicio);
      if (filtroFechaFin) params.append('fecha_fin', filtroFechaFin);
      params.append('anio', year);
      
      const url = `/api/reportes-cierre${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Error cargando datos");
      }

      const data = await response.json();
      
      if (year === "2024") {
        setResumen2024(data.resumen || []);
        setEstadisticas2024(data.estadisticas || null);
      } else {
        setResumen2025(data.resumen || []);
        setEstadisticas2025(data.estadisticas || null);
      }
    } catch (err) {
      console.error(err);
      toast.error(`Error cargando datos de reportes ${year}`);
    } finally {
      const isLoading = year === "2024" ? setIsLoading2024 : setIsLoading2025;
      isLoading(false);
    }
  };

  useEffect(() => {
    fetchData("2024");
    fetchData("2025");
  }, []);

  // Función para aplicar filtros
  const aplicarFiltros = () => {
    fetchData(selectedYear);
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltroCodigo("");
    setFiltroFechaInicio("");
    setFiltroFechaFin("");
    fetchData(selectedYear);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-VE').format(num);
  };

  const renderDashboard = (year: string) => {
    const resumen = year === "2024" ? resumen2024 : resumen2025;
    const estadisticas = year === "2024" ? estadisticas2024 : estadisticas2025;
    const isLoading = year === "2024" ? isLoading2024 : isLoading2025;

    return (
      <div>
        {/* Dashboard de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Conceptos {year}</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {estadisticas ? formatNumber(estadisticas.total_conceptos || 0) : '0'}
                  </p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Monto {year}</p>
                  <p className="text-2xl font-bold text-green-900">
                    {estadisticas ? formatCurrency(estadisticas.total_monto || 0) : 'Bs. 0,00'}
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Promedio Monto {year}</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {estadisticas ? formatCurrency(estadisticas.promedio_monto || 0) : 'Bs. 0,00'}
                  </p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Códigos Únicos {year}</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {resumen.length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h1 className="text-xl font-bold text-blue-900">Reportes de Cierre {year}</h1>
            <Button 
              onClick={() => {
                setSelectedYear(year);
                setOpenGenerar(true);
              }} 
              className="bg-green-600 hover:bg-green-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generar Reporte {year}
            </Button>
          </CardHeader>
          <CardContent>
            {/* Filtros de búsqueda */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Filtros de Búsqueda</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="filtro-codigo">Código Presupuestario</Label>
                  <Input
                    id="filtro-codigo"
                    value={filtroCodigo}
                    onChange={(e) => setFiltroCodigo(e.target.value)}
                    placeholder="Buscar código..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filtro-fecha-inicio">Fecha Inicio</Label>
                  <Input
                    id="filtro-fecha-inicio"
                    type="date"
                    value={filtroFechaInicio}
                    onChange={(e) => setFiltroFechaInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filtro-fecha-fin">Fecha Fin</Label>
                  <Input
                    id="filtro-fecha-fin"
                    type="date"
                    value={filtroFechaFin}
                    onChange={(e) => setFiltroFechaFin(e.target.value)}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={aplicarFiltros} className="flex-1">
                    Aplicar Filtros
                  </Button>
                  <Button variant="outline" onClick={limpiarFiltros}>
                    Limpiar
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabla de Resumen */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Resumen por Código Presupuestario {year}</h3>
              {isLoading ? (
                <SkeletonTable />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell>Código Presupuestario</TableCell>
                      <TableCell>Designación</TableCell>
                      <TableCell>Cantidad Conceptos</TableCell>
                      <TableCell>Total Monto</TableCell>
                      <TableCell>Promedio</TableCell>
                      <TableCell>Máximo</TableCell>
                      <TableCell>Mínimo</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resumen.length === 0 ? (
                      <TableRow>
                                              <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No se encontraron datos para {year}
                      </TableCell>
                      </TableRow>
                    ) : (
                      resumen.map((item, index) => (
                        <TableRow key={index}>
                                            <TableCell className="font-mono font-medium">
                    {item.codigo_presupuestario}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {item.designacion_presupuestario}
                  </TableCell>
                  <TableCell className="text-center">
                    {formatNumber(item.cantidad_conceptos)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(item.total_monto)}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(item.promedio_monto)}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(item.monto_maximo)}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(item.monto_minimo)}
                  </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setFiltroCodigo(item.codigo_presupuestario);
                                setSelectedYear(year);
                                setOpenGenerar(true);
                              }}
                            >
                              Generar Reporte
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Reportes de Cierre</h1>
        <p className="text-gray-600">Gestiona y genera reportes financieros de cierre por año</p>
      </div>

      <Tabs defaultValue="2024" className="w-full" onValueChange={setSelectedYear}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="2024" className="text-lg font-semibold">
            📊 Reportes 2024
          </TabsTrigger>
          <TabsTrigger value="2025" className="text-lg font-semibold">
            📊 Reportes 2025
          </TabsTrigger>
        </TabsList>

        <TabsContent value="2024">
          {renderDashboard("2024")}
        </TabsContent>

        <TabsContent value="2025">
          {renderDashboard("2025")}
        </TabsContent>
      </Tabs>

      {/* Modal para generar reporte */}
      <GenerarReporteModal
        open={openGenerar}
        onOpenChange={setOpenGenerar}
        codigoPresupuestario={filtroCodigo}
        selectedYear={selectedYear}
        onSuccess={() => {
          setOpenGenerar(false);
          fetchData(selectedYear);
          toast.success(`Reporte ${selectedYear} generado exitosamente`);
        }}
      />
    </div>
  );
} 