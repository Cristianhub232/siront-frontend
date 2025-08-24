'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconBuilding, IconFileText, IconCalculator, IconAlertTriangle, IconUsers, IconChartPie, IconTrendingUp, IconDatabase } from '@tabler/icons-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface DashboardStats {
  empresas_petroleras: number;
  formas_presupuestarias: number;
  codigos_presupuestarios: number;
  usuarios: number;
  bancos: number;
  formas_no_validadas: number;
  planillas_recaudacion: number;
  total_monto_formas_no_validadas: number;
  total_monto_planillas: number;
  total_conceptos: number;
  total_monto_conceptos: number;
  distribucion_mensual: any[];
  top_formas: any[];
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData[]>([]);

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

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // Obtener todas las estadísticas del dashboard desde el endpoint consolidado
      const response = await fetch('/api/dashboard');
      const result = await response.json();

      if (result.success) {
        const dashboardStats: DashboardStats = {
          empresas_petroleras: result.data.empresas_petroleras || 0,
          formas_presupuestarias: result.data.formas_presupuestarias || 0,
          codigos_presupuestarios: result.data.codigos_presupuestarios || 0,
          usuarios: result.data.usuarios || 0,
          bancos: result.data.bancos || 0,
          formas_no_validadas: result.data.formas_no_validadas || 0,
          planillas_recaudacion: result.data.planillas_recaudacion || 0,
          total_monto_formas_no_validadas: result.data.total_monto_formas_no_validadas || 0,
          total_monto_planillas: result.data.total_monto_planillas || 0,
          total_conceptos: result.data.total_conceptos || 0,
          total_monto_conceptos: result.data.total_monto_conceptos || 0,
          distribucion_mensual: result.data.distribucion_mensual || [],
          top_formas: result.data.top_formas || []
        };

        setStats(dashboardStats);

        // Preparar datos para gráficos
        const chartData: ChartData[] = [
          {
            name: 'Empresas Petroleras',
            value: dashboardStats.empresas_petroleras,
            color: '#3b82f6'
          },
          {
            name: 'Formas Presupuestarias',
            value: dashboardStats.formas_presupuestarias,
            color: '#10b981'
          },
          {
            name: 'Códigos Presupuestarios',
            value: dashboardStats.codigos_presupuestarios,
            color: '#f59e0b'
          },
          {
            name: 'Usuarios',
            value: dashboardStats.usuarios,
            color: '#8b5cf6'
          }
        ];

        setChartData(chartData);
      } else {
        throw new Error(result.error || 'Error obteniendo estadísticas');
      }

    } catch (error) {
      console.error('Error obteniendo estadísticas del dashboard:', error);
      toast.error('Error cargando estadísticas del dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Resumen general del sistema SIRONT</p>
      </div>

      {/* Tarjetas de Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Empresas Petroleras</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatNumber(stats?.empresas_petroleras || 0)}
                </p>
              </div>
              <IconBuilding className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Formas Presupuestarias</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatNumber(stats?.formas_presupuestarias || 0)}
                </p>
              </div>
              <IconFileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Códigos Presupuestarios</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {formatNumber(stats?.codigos_presupuestarios || 0)}
                </p>
              </div>
              <IconCalculator className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Usuarios</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatNumber(stats?.usuarios || 0)}
                </p>
              </div>
              <IconUsers className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tarjetas de Alertas y Estados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Formas No Validadas</p>
                <p className="text-2xl font-bold text-red-900">
                  {formatNumber(stats?.formas_no_validadas || 0)}
                </p>
                <p className="text-sm text-red-600">
                  Total: {formatCurrency(stats?.total_monto_formas_no_validadas || 0)}
                </p>
              </div>
              <IconAlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Planillas de Recaudación</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {formatNumber(stats?.planillas_recaudacion || 0)}
                </p>
                <p className="text-sm text-emerald-600">
                  Total: {formatCurrency(stats?.total_monto_planillas || 0)}
                </p>
              </div>
              <IconDatabase className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-indigo-50 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600">Bancos</p>
                <p className="text-2xl font-bold text-indigo-900">
                  {formatNumber(stats?.bancos || 0)}
                </p>
                <p className="text-sm text-indigo-600">
                  Entidades financieras
                </p>
              </div>
              <IconBuilding className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Conceptos</p>
                <p className="text-2xl font-bold text-orange-900">
                  {formatNumber(stats?.total_conceptos || 0)}
                </p>
                <p className="text-sm text-orange-600">
                  Total: {formatCurrency(stats?.total_monto_conceptos || 0)}
                </p>
              </div>
              <IconCalculator className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos y Visualizaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconChartPie className="h-5 w-5" />
              Distribución de Entidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <Badge variant="secondary">{formatNumber(item.value)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconTrendingUp className="h-5 w-5" />
              Resumen Financiero
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-red-700">Formas No Validadas</span>
                <span className="text-lg font-bold text-red-900">
                  {formatCurrency(stats?.total_monto_formas_no_validadas || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                <span className="text-sm font-medium text-emerald-700">Planillas Validadas</span>
                <span className="text-lg font-bold text-emerald-900">
                  {formatCurrency(stats?.total_monto_planillas || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-700">Total General</span>
                <span className="text-lg font-bold text-blue-900">
                  {formatCurrency((stats?.total_monto_formas_no_validadas || 0) + (stats?.total_monto_planillas || 0))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Formas Más Utilizadas */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconFileText className="h-5 w-5" />
              Formas Más Utilizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.top_formas && stats.top_formas.length > 0 ? (
                stats.top_formas.map((forma, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium text-gray-900">{forma.nombre_forma}</p>
                        <p className="text-sm text-gray-600">Código: {forma.codigo_forma}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatNumber(forma.cantidad_planillas)}</p>
                      <p className="text-sm text-gray-600">{formatCurrency(forma.monto_total)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información Adicional */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">Última Actualización</p>
                <p className="text-gray-600">{new Date().toLocaleString('es-VE')}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Estado del Sistema</p>
                <Badge className="bg-green-100 text-green-800">Operativo</Badge>
              </div>
              <div>
                <p className="font-medium text-gray-700">Versión</p>
                <p className="text-gray-600">SIRONT v1.0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 