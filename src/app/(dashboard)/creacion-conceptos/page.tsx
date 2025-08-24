"use client";

import React, { useEffect, useState } from "react";
import {
  Table, TableHeader, TableRow, TableCell, TableBody,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  IconCalculator, 
  IconLink, 
  IconRefresh, 
  IconAlertTriangle, 
  IconCircleCheck,
  IconFileInvoice,
  IconPlus,
  IconSearch,
  IconX,
  IconLoader2,
  IconEye,
  IconChevronDown
} from "@tabler/icons-react";
import type { 
  PlanillaSinConcepto, 
  FormaAgrupada, 
  CodigoPresupuestario, 
  VinculacionForma,
  ResultadoCreacion 
} from "@/types/creacionConceptos";

export default function CreacionConceptosPage() {
  const [planillas, setPlanillas] = useState<PlanillaSinConcepto[]>([]);
  const [formasAgrupadas, setFormasAgrupadas] = useState<FormaAgrupada[]>([]);
  const [codigosPresupuestarios, setCodigosPresupuestarios] = useState<CodigoPresupuestario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPlanillas, setTotalPlanillas] = useState(0);
  const [totalMonto, setTotalMonto] = useState(0);
  
  // Filtros
  const [filtroRif, setFiltroRif] = useState("");
  const [filtroForma, setFiltroForma] = useState("");
  
  // Vinculaciones
  const [vinculaciones, setVinculaciones] = useState<VinculacionForma[]>([]);
  
  // Buscador de códigos presupuestarios
  const [busquedaCodigo, setBusquedaCodigo] = useState("");
  const [codigosFiltrados, setCodigosFiltrados] = useState<CodigoPresupuestario[]>([]);
  const [dropdownAbierto, setDropdownAbierto] = useState<number | null>(null);
  
  // Modal de progreso
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressLog, setProgressLog] = useState<string[]>([]);
  
  // Modal de planillas
  const [showPlanillasModal, setShowPlanillasModal] = useState(false);
  const [planillasForma, setPlanillasForma] = useState<PlanillaSinConcepto[]>([]);
  const [formaSeleccionada, setFormaSeleccionada] = useState<FormaAgrupada | null>(null);
  const [loadingPlanillas, setLoadingPlanillas] = useState(false);

  const fetchData = async (page = 1, rif?: string, forma?: string) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '25'
      });
      
      if (rif) params.append('rif', rif);
      if (forma) params.append('forma', forma);
      
      const response = await fetch(`/api/creacion-conceptos?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setPlanillas(data.planillas);
        setFormasAgrupadas(data.formasAgrupadas);
        setCodigosPresupuestarios(data.codigosPresupuestarios);
        setTotalPlanillas(data.pagination.total);
        setTotalMonto(data.totalMonto);
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
      } else {
        toast.error('Error cargando datos');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error cargando datos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Filtrar códigos presupuestarios basado en la búsqueda
    if (busquedaCodigo.trim()) {
      const filtrados = codigosPresupuestarios.filter(codigo =>
        codigo.codigo_presupuestario.toLowerCase().includes(busquedaCodigo.toLowerCase()) ||
        codigo.designacion_presupuestario.toLowerCase().includes(busquedaCodigo.toLowerCase())
      );
      setCodigosFiltrados(filtrados);
    } else {
      setCodigosFiltrados([]);
    }
  }, [busquedaCodigo, codigosPresupuestarios]);

  const handleVinculacionChange = (codigoForma: number, codigoPresupuestarioId: number) => {
    const forma = formasAgrupadas.find(f => f.codigo_forma === codigoForma);
    const codigo = codigosPresupuestarios.find(c => c.id === codigoPresupuestarioId);
    
    if (forma && codigo) {
      setVinculaciones(prev => {
        const existing = prev.find(v => v.codigo_forma === codigoForma);
        if (existing) {
          return prev.map(v => 
            v.codigo_forma === codigoForma 
              ? { ...v, codigo_presupuestario_id: codigoPresupuestarioId }
              : v
          );
        } else {
          return [...prev, {
            codigo_forma: codigoForma,
            nombre_forma: forma.nombre_forma,
            codigo_presupuestario_id: codigoPresupuestarioId,
            codigo_presupuestario: codigo.codigo_presupuestario,
            designacion_presupuestario: codigo.designacion_presupuestario
          }];
        }
      });
    }
  };

  const aplicarFiltros = () => {
    fetchData(1, filtroRif, filtroForma);
  };

  const limpiarFiltros = () => {
    setFiltroRif("");
    setFiltroForma("");
    fetchData(1);
  };

  const handleProcesarVinculaciones = async () => {
    if (vinculaciones.length === 0) {
      toast.error('No hay vinculaciones para procesar');
      return;
    }

    setIsProcessing(true);
    setShowProgressModal(true);
    setProgressLog([]);

    try {
      const response = await fetch('/api/creacion-conceptos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vinculaciones }),
      });

      const result: ResultadoCreacion = await response.json();

      if (response.ok) {
        setProgressLog(prev => [...prev, 
          `✅ Procesamiento completado`,
          `📊 Planillas procesadas: ${result.planillas_procesadas}`,
          `💡 Conceptos creados: ${result.conceptos_creados}`,
          `✅ Planillas validadas: ${result.planillas_validadas}`
        ]);
        
        if (result.errores.length > 0) {
          setProgressLog(prev => [...prev, '⚠️ Errores encontrados:', ...result.errores]);
        }
        
        toast.success('Vinculaciones procesadas exitosamente');
        
        // Recargar datos
        setTimeout(() => {
          fetchData();
          setVinculaciones([]);
        }, 2000);
      } else {
        setProgressLog(prev => [...prev, `❌ Error: ${result.errores.join(', ')}`]);
        toast.error('Error procesando vinculaciones');
      }
    } catch (error) {
      console.error('Error:', error);
      setProgressLog(prev => [...prev, `❌ Error de conexión`]);
      toast.error('Error de conexión');
    } finally {
      setIsProcessing(false);
    }
  };

  const verPlanillasForma = async (forma: FormaAgrupada) => {
    setFormaSeleccionada(forma);
    setShowPlanillasModal(true);
    setLoadingPlanillas(true);

    try {
      const response = await fetch(`/api/creacion-conceptos/planillas-forma?codigo_forma=${forma.codigo_forma}`);
      const data = await response.json();
      
      if (response.ok) {
        setPlanillasForma(data.planillas);
      } else {
        toast.error('Error cargando planillas de la forma');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error cargando planillas de la forma');
    } finally {
      setLoadingPlanillas(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES'
    }).format(num);
  };

  return (
    <div className="container mx-auto p-6">
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Planillas Sin Conceptos</p>
                <p className="text-2xl font-bold text-blue-900">{totalPlanillas.toLocaleString()}</p>
                <p className="text-xs text-blue-600">Planillas pendientes de vinculación</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <IconFileInvoice className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Monto Total</p>
                <p className="text-2xl font-bold text-green-900">{formatNumber(totalMonto)}</p>
                <p className="text-xs text-green-600">Monto total de planillas sin conceptos</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <IconCalculator className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Formas Diferentes</p>
                <p className="text-2xl font-bold text-yellow-900">{formasAgrupadas.length}</p>
                <p className="text-xs text-yellow-600">Tipos de formas sin conceptos</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <IconAlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vinculación de Formas */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconLink className="h-5 w-5" />
            Vinculación de Formas con Códigos Presupuestarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {formasAgrupadas.map((forma, index) => {
                // Definir colores basados en el índice para crear variedad
                const colorVariants = [
                  'bg-blue-50 border-blue-200 hover:bg-blue-100',
                  'bg-green-50 border-green-200 hover:bg-green-100',
                  'bg-purple-50 border-purple-200 hover:bg-purple-100',
                  'bg-orange-50 border-orange-200 hover:bg-orange-100',
                  'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
                  'bg-teal-50 border-teal-200 hover:bg-teal-100'
                ];
                const colorVariant = colorVariants[index % colorVariants.length];
                
                return (
                  <div key={forma.codigo_forma} className={`p-4 border rounded-lg transition-all duration-200 ${colorVariant}`}>
                    <div className="mb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-gray-900">{forma.nombre_forma}</h4>
                          <p className="text-xs text-gray-600">Código: {forma.codigo_forma}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs bg-white/80 text-gray-700 border-gray-300">
                              {forma.cantidad_planillas} planillas
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-white/80 text-gray-700 border-gray-300">
                              {formatNumber(forma.monto_total)}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => verPlanillasForma(forma)}
                          className="ml-2 h-8 w-8 p-0 hover:bg-white/50 hover:text-gray-700 transition-all duration-200"
                          title="Ver planillas"
                        >
                          <IconEye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <Select
                      value={vinculaciones.find(v => v.codigo_forma === forma.codigo_forma)?.codigo_presupuestario_id?.toString() || ""}
                      onValueChange={(value) => handleVinculacionChange(forma.codigo_forma, parseInt(value))}
                      onOpenChange={(open) => {
                        if (open) {
                          setDropdownAbierto(forma.codigo_forma);
                          setBusquedaCodigo("");
                        } else {
                          setDropdownAbierto(null);
                          setBusquedaCodigo("");
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar código presupuestario" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Buscador dentro del dropdown */}
                        {dropdownAbierto === forma.codigo_forma && (
                          <div className="p-2 border-b">
                            <div className="relative">
                              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                value={busquedaCodigo}
                                onChange={(e) => setBusquedaCodigo(e.target.value)}
                                placeholder="Buscar código o descripción..."
                                className="pl-10 h-8 text-sm"
                                onClick={(e) => e.stopPropagation()}
                              />
                              {busquedaCodigo && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setBusquedaCodigo("");
                                  }}
                                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                >
                                  <IconX className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            {busquedaCodigo && (
                              <p className="text-xs text-gray-500 mt-1">
                                {codigosFiltrados.length} código(s) encontrado(s)
                              </p>
                            )}
                          </div>
                        )}
                        
                        {/* Lista de códigos */}
                        <div className="max-h-60 overflow-y-auto">
                          {(busquedaCodigo ? codigosFiltrados : codigosPresupuestarios).map((codigo) => (
                            <SelectItem key={codigo.id} value={codigo.id.toString()}>
                              <div className="flex flex-col">
                                <span className="font-medium">{codigo.codigo_presupuestario}</span>
                                <span className="text-xs text-gray-500 truncate">
                                  {codigo.designacion_presupuestario}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                          {busquedaCodigo && codigosFiltrados.length === 0 && (
                            <div className="px-2 py-2 text-sm text-gray-500 text-center">
                              No se encontraron códigos
                            </div>
                          )}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>

            {vinculaciones.length > 0 && (
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <p className="font-medium text-blue-900">
                    {vinculaciones.length} vinculación(es) seleccionada(s)
                  </p>
                  <p className="text-sm text-blue-700">
                    Listo para procesar la creación de conceptos
                  </p>
                </div>
                <Button 
                  onClick={handleProcesarVinculaciones}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? (
                    <>
                      <IconRefresh className="h-4 w-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <IconPlus className="h-4 w-4 mr-2" />
                      Procesar Vinculaciones
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filtro-rif">RIF Contribuyente</Label>
              <Input
                id="filtro-rif"
                value={filtroRif}
                onChange={(e) => setFiltroRif(e.target.value)}
                placeholder="Buscar por RIF..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filtro-forma">Código de Forma</Label>
              <Input
                id="filtro-forma"
                value={filtroForma}
                onChange={(e) => setFiltroForma(e.target.value)}
                placeholder="Buscar por código de forma..."
              />
            </div>
            
            <div className="flex items-end gap-2">
              <Button onClick={aplicarFiltros} className="flex-1">
                <IconSearch className="h-4 w-4 mr-2" />
                Buscar
              </Button>
              <Button variant="outline" onClick={limpiarFiltros}>
                <IconRefresh className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Planillas */}
      <Card>
        <CardHeader>
          <CardTitle>Planillas Sin Conceptos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell>RIF Contribuyente</TableCell>
                      <TableCell>Número Planilla</TableCell>
                      <TableCell>Monto Total</TableCell>
                      <TableCell>Código Forma</TableCell>
                      <TableCell>Nombre Forma</TableCell>
                      <TableCell>Fecha</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {planillas.map((planilla) => (
                      <TableRow key={planilla.id}>
                        <TableCell className="font-medium">{planilla.rif_contribuyente}</TableCell>
                        <TableCell>{planilla.num_planilla}</TableCell>
                        <TableCell>{formatNumber(planilla.monto_total_trans)}</TableCell>
                        <TableCell>{planilla.codigo_forma}</TableCell>
                        <TableCell>{planilla.nombre_forma}</TableCell>
                        <TableCell>
                          {planilla.fecha_trans ? new Date(planilla.fecha_trans).toLocaleDateString('es-VE') : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchData(currentPage - 1, filtroRif, filtroForma)}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchData(currentPage + 1, filtroRif, filtroForma)}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de Progreso */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Procesando Vinculaciones</h3>
              {!isProcessing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProgressModal(false)}
                >
                  <IconX className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="max-h-60 overflow-y-auto mb-4">
              {progressLog.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <IconLoader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Iniciando procesamiento...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {progressLog.map((log, index) => (
                    <div key={index} className="text-sm">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {!isProcessing && (
              <div className="mt-4 flex justify-end">
                <Button onClick={() => setShowProgressModal(false)}>
                  Cerrar
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Planillas */}
      {showPlanillasModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">
                  Planillas de {formaSeleccionada?.nombre_forma}
                </h3>
                <p className="text-sm text-gray-600">
                  Código: {formaSeleccionada?.codigo_forma} • 
                  {formaSeleccionada?.cantidad_planillas} planillas • 
                  Total: {formaSeleccionada ? formatNumber(formaSeleccionada.monto_total) : ''}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowPlanillasModal(false);
                  setPlanillasForma([]);
                  setFormaSeleccionada(null);
                }}
              >
                <IconX className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="overflow-y-auto max-h-[60vh]">
              {loadingPlanillas ? (
                <div className="flex items-center justify-center py-8">
                  <IconLoader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Cargando planillas...</span>
                </div>
              ) : planillasForma.length > 0 ? (
                <div className="space-y-2">
                  {planillasForma.map((planilla) => (
                    <div key={planilla.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{planilla.rif_contribuyente}</span>
                            <Badge variant="outline" className="text-xs">
                              {planilla.num_planilla}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span>Monto: {formatNumber(planilla.monto_total_trans)}</span>
                            {planilla.fecha_trans && (
                              <span>Fecha: {new Date(planilla.fecha_trans).toLocaleDateString('es-VE')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron planillas para esta forma
                </div>
              )}
            </div>
            
            <div className="mt-4 flex justify-between items-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                Mostrando {planillasForma.length} de {formaSeleccionada?.cantidad_planillas} planillas
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setShowPlanillasModal(false);
                  setPlanillasForma([]);
                  setFormaSeleccionada(null);
                }}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 