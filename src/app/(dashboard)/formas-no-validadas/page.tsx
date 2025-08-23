'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconRefresh, IconChartPie, IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react';
import { Skeleton } from '@/components/ui/skeleton';
import { FormaNoValidada, FormaNoValidadaStats, FormaNoValidadaResumen, PaginationInfo } from '@/types/formaNoValidada';
import { toast } from 'sonner';

export default function FormasNoValidadasPage() {
  const [formas, setFormas] = useState<FormaNoValidada[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<FormaNoValidadaStats | null>(null);
  const [resumen, setResumen] = useState<FormaNoValidadaResumen[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 25,
    totalRecords: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

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

  const fetchData = async (page = 1, limit = 25) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await fetch(`/api/formas-no-validadas?${params}`);
      const result = await response.json();

      if (result.success) {
        setFormas(result.data);
        setStats(result.stats);
        setResumen(result.resumen);
        setPagination(result.pagination);
      } else {
        console.error('Error en la respuesta:', result.error);
        toast.error('Error cargando datos');
      }
    } catch (error) {
      console.error('Error al obtener formas no validadas:', error);
      toast.error('Error al obtener datos');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchData(newPage, pagination.limit);
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit }));
    fetchData(1, newLimit);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Colores para los gráficos de torta
  const colors = [
    '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e',
    '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-red-900 mb-2">Formas no Validadas</h1>
        <p className="text-gray-600">Análisis de planillas con formas no validadas en el sistema</p>
      </div>

      {/* Dashboard de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Formas No Validadas</p>
                <p className="text-2xl font-bold text-red-900">
                  {stats ? formatNumber(stats.total_formas_no_validadas) : '...'}
                </p>
                <p className="text-xs text-red-600">
                  {stats ? `${stats.porcentaje_no_validadas}% del total` : ''}
                </p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <IconAlertTriangle className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Formas Validadas</p>
                <p className="text-2xl font-bold text-green-900">
                  {stats ? formatNumber(stats.total_formas_validadas) : '...'}
                </p>
                <p className="text-xs text-green-600">
                  {stats ? `${(100 - stats.porcentaje_no_validadas).toFixed(1)}% del total` : ''}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <IconCircleCheck className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Monto No Validadas</p>
                <p className="text-lg font-bold text-orange-900">
                  {stats ? formatCurrency(stats.total_monto_no_validadas) : '...'}
                </p>
                <p className="text-xs text-orange-600">
                  {stats ? `${stats.porcentaje_monto_no_validadas}% del total` : ''}
                </p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <IconChartPie className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Monto Validadas</p>
                <p className="text-lg font-bold text-blue-900">
                  {stats ? formatCurrency(stats.total_monto_validadas) : '...'}
                </p>
                <p className="text-xs text-blue-600">
                  {stats ? `${(100 - stats.porcentaje_monto_no_validadas).toFixed(1)}% del total` : ''}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <IconChartPie className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Torta */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gráfico de Torta - Cantidad de Planillas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconChartPie className="w-5 h-5 text-red-600" />
              Distribución por Cantidad de Planillas (Escala Ampliada)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="relative w-48 h-48">
                {stats && (
                  <>
                    {/* Círculo principal con escala ampliada */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* Formas Validadas (escala ampliada) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="20"
                        strokeDasharray={`${(100 - stats.porcentaje_no_validadas) * 2.51} ${stats.porcentaje_no_validadas * 2.51}`}
                        strokeDashoffset="0"
                      />
                      {/* Formas No Validadas (escala ampliada) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="20"
                        strokeDasharray={`${stats.porcentaje_no_validadas * 2.51} ${(100 - stats.porcentaje_no_validadas) * 2.51}`}
                        strokeDashoffset={`-${(100 - stats.porcentaje_no_validadas) * 2.51}`}
                      />
                    </svg>
                    
                    {/* Texto central con información detallada */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-lg font-bold text-gray-800 text-center">
                        <div className="text-red-600">{stats.porcentaje_no_validadas.toFixed(2)}%</div>
                        <div className="text-xs text-gray-600">No Validadas</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatNumber(stats.total_formas_no_validadas)} planillas
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Información detallada */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-600 text-center mb-2">
                <strong>Distribución Exacta:</strong>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Validadas: {stats ? formatNumber(stats.total_formas_validadas) : '...'} ({stats ? (100 - stats.porcentaje_no_validadas).toFixed(2) : '...'}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>No Validadas: {stats ? formatNumber(stats.total_formas_no_validadas) : '...'} ({stats ? stats.porcentaje_no_validadas.toFixed(2) : '...'}%)</span>
                </div>
              </div>
            </div>
            
            {/* Gráfico de barras adicional para mejor visualización */}
            <div className="mt-4">
              <div className="text-xs text-gray-600 text-center mb-2">
                <strong>Comparación Visual:</strong>
              </div>
              <div className="flex h-4 bg-gray-200 rounded-full overflow-hidden">
                {stats && (
                  <>
                    <div 
                      className="bg-green-500 transition-all duration-500"
                      style={{ width: `${100 - stats.porcentaje_no_validadas}%` }}
                    ></div>
                    <div 
                      className="bg-red-500 transition-all duration-500"
                      style={{ width: `${stats.porcentaje_no_validadas}%` }}
                    ></div>
                  </>
                )}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Torta - Montos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconChartPie className="w-5 h-5 text-orange-600" />
              Distribución por Montos (Escala Ampliada)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="relative w-48 h-48">
                {stats && (
                  <>
                    {/* Círculo principal con escala ampliada */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* Montos Validadas (escala ampliada) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="20"
                        strokeDasharray={`${(100 - stats.porcentaje_monto_no_validadas) * 2.51} ${stats.porcentaje_monto_no_validadas * 2.51}`}
                        strokeDashoffset="0"
                      />
                      {/* Montos No Validadas (escala ampliada) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="20"
                        strokeDasharray={`${stats.porcentaje_monto_no_validadas * 2.51} ${(100 - stats.porcentaje_monto_no_validadas) * 2.51}`}
                        strokeDashoffset={`-${(100 - stats.porcentaje_monto_no_validadas) * 2.51}`}
                      />
                    </svg>
                    
                    {/* Texto central con información detallada */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-lg font-bold text-gray-800 text-center">
                        <div className="text-orange-600">{stats.porcentaje_monto_no_validadas.toFixed(2)}%</div>
                        <div className="text-xs text-gray-600">Monto No Validado</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatCurrency(stats.total_monto_no_validadas)}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Información detallada */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-600 text-center mb-2">
                <strong>Distribución Exacta de Montos:</strong>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Validadas: {stats ? formatCurrency(stats.total_monto_validadas) : '...'} ({stats ? (100 - stats.porcentaje_monto_no_validadas).toFixed(2) : '...'}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>No Validadas: {stats ? formatCurrency(stats.total_monto_no_validadas) : '...'} ({stats ? stats.porcentaje_monto_no_validadas.toFixed(2) : '...'}%)</span>
                </div>
              </div>
            </div>
            
            {/* Gráfico de barras adicional para mejor visualización */}
            <div className="mt-4">
              <div className="text-xs text-gray-600 text-center mb-2">
                <strong>Comparación Visual de Montos:</strong>
              </div>
              <div className="flex h-4 bg-gray-200 rounded-full overflow-hidden">
                {stats && (
                  <>
                    <div 
                      className="bg-blue-500 transition-all duration-500"
                      style={{ width: `${100 - stats.porcentaje_monto_no_validadas}%` }}
                    ></div>
                    <div 
                      className="bg-orange-500 transition-all duration-500"
                      style={{ width: `${stats.porcentaje_monto_no_validadas}%` }}
                    ></div>
                  </>
                )}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top 10 Formas No Validadas */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Top 10 Formas No Validadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-xs">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-2 py-1 text-left font-medium">Código</th>
                  <th className="border border-gray-300 px-2 py-1 text-left font-medium">Nombre Forma</th>
                  <th className="border border-gray-300 px-2 py-1 text-left font-medium">Cantidad</th>
                  <th className="border border-gray-300 px-2 py-1 text-left font-medium">Monto Total</th>
                  <th className="border border-gray-300 px-2 py-1 text-left font-medium">Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                {resumen.map((forma, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-2 py-1 font-mono">
                      {forma.codigo_forma}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {forma.nombre_forma}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      {formatNumber(forma.cantidad_planillas)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 font-medium">
                      {formatCurrency(forma.monto_total)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      <Badge variant="outline" className="text-xs">
                        {forma.porcentaje_forma}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Formas No Validadas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Detalle de Formas No Validadas</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData(pagination.page, pagination.limit)}
              className="flex items-center gap-2"
            >
              <IconRefresh className="w-4 h-4" />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[60px]" />
                  <Skeleton className="h-4 w-[80px]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-2 py-1 text-left font-medium">RIF</th>
                    <th className="border border-gray-300 px-2 py-1 text-left font-medium">Número Planilla</th>
                    <th className="border border-gray-300 px-2 py-1 text-left font-medium">Monto Total</th>
                    <th className="border border-gray-300 px-2 py-1 text-left font-medium">Código Forma</th>
                    <th className="border border-gray-300 px-2 py-1 text-left font-medium">Nombre Forma</th>
                  </tr>
                </thead>
                <tbody>
                  {formas.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="border border-gray-300 px-2 py-4 text-center text-gray-500">
                        No se encontraron formas no validadas
                      </td>
                    </tr>
                  ) : (
                    formas.map((forma, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-2 py-1 font-mono">
                          {forma.rif_contribuyente}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          {forma.num_planilla}
                        </td>
                        <td className="border border-gray-300 px-2 py-1 font-medium">
                          {formatCurrency(forma.monto_total_trans)}
                        </td>
                        <td className="border border-gray-300 px-2 py-1 font-mono">
                          {forma.codigo_forma}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          {forma.nombre_forma}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {!loading && formas.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.totalRecords)} de {formatNumber(pagination.totalRecords)} registros
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-3 text-sm">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 