'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconSearch, IconRefresh, IconFileText, IconCalendar, IconCurrencyDollar, IconBuilding, IconUsers } from '@tabler/icons-react';
import { PlanillaRecaudacion, PlanillaRecaudacionFilters, PlanillaRecaudacionStats, PaginationInfo } from '@/types/planillaRecaudacion';
import { SkeletonTable } from '@/components/skeletons/tables/Table';

export default function PlanillasRecaudacionPage() {
  const [planillas, setPlanillas] = useState<PlanillaRecaudacion[]>([]);
  const [stats, setStats] = useState<PlanillaRecaudacionStats>({
    total_planillas: 0,
    monto_total: 0,
    promedio_monto: 0,
    bancos_unicos: 0,
    contribuyentes_unicos: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<PlanillaRecaudacionFilters>({});
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 1000,
    totalRecords: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Estados para los filtros
  const [filtroRif, setFiltroRif] = useState('');
  const [filtroPlanilla, setFiltroPlanilla] = useState('');
  const [filtroBanco, setFiltroBanco] = useState('');
  const [filtroCodigoBanco, setFiltroCodigoBanco] = useState('');
  const [filtroCodigoPresupuestario, setFiltroCodigoPresupuestario] = useState('');
  const [filtroDesignacion, setFiltroDesignacion] = useState('');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');
  const [filtroMontoMinimo, setFiltroMontoMinimo] = useState('');
  const [filtroMontoMaximo, setFiltroMontoMaximo] = useState('');

  const fetchPlanillas = async (filterParams?: PlanillaRecaudacionFilters, pageNum: number = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      
      const activeFilters = filterParams || filters;
      
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });

      // Agregar parámetros de paginación
      params.append('page', pageNum.toString());
      params.append('limit', pagination.limit.toString());

      const response = await fetch(`/api/planillas-recaudacion?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setPlanillas(result.data);
        setStats(result.stats);
        setPagination(result.pagination);
      } else {
        console.error('Error al obtener planillas:', result.error);
      }
    } catch (error) {
      console.error('Error al obtener planillas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanillas();
  }, []);

  const handleSearch = () => {
    const newFilters: PlanillaRecaudacionFilters = {};
    
    if (filtroRif) newFilters.rif_contribuyente = filtroRif;
    if (filtroPlanilla) newFilters.cod_seg_planilla = filtroPlanilla;
    if (filtroBanco) newFilters.nombre_banco = filtroBanco;
    if (filtroCodigoBanco) newFilters.codigo_banco = filtroCodigoBanco;
    if (filtroCodigoPresupuestario) newFilters.codigo_presupuestario = filtroCodigoPresupuestario;
    if (filtroDesignacion) newFilters.designacion_presupuestario = filtroDesignacion;
    if (filtroFechaDesde) newFilters.fecha_desde = filtroFechaDesde;
    if (filtroFechaHasta) newFilters.fecha_hasta = filtroFechaHasta;
    if (filtroMontoMinimo) newFilters.monto_minimo = parseFloat(filtroMontoMinimo);
    if (filtroMontoMaximo) newFilters.monto_maximo = parseFloat(filtroMontoMaximo);

    setFilters(newFilters);
    fetchPlanillas(newFilters, 1); // Resetear a la primera página
  };

  const handleClearFilters = () => {
    setFiltroRif('');
    setFiltroPlanilla('');
    setFiltroBanco('');
    setFiltroCodigoBanco('');
    setFiltroCodigoPresupuestario('');
    setFiltroDesignacion('');
    setFiltroFechaDesde('');
    setFiltroFechaHasta('');
    setFiltroMontoMinimo('');
    setFiltroMontoMaximo('');
    setFilters({});
    fetchPlanillas({}, 1); // Resetear a la primera página
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handlePageChange = (newPage: number) => {
    fetchPlanillas(filters, newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit }));
    fetchPlanillas(filters, 1); // Resetear a la primera página con nuevo límite
  };

  return (
    <div className="p-6">
      {/* Dashboard de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Planillas</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total_planillas.toLocaleString()}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <IconFileText className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Monto Total</p>
                <p className="text-lg font-bold text-green-900">{formatCurrency(stats.monto_total)}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <IconCurrencyDollar className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Promedio</p>
                <p className="text-lg font-bold text-yellow-900">{formatCurrency(stats.promedio_monto)}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <IconCurrencyDollar className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Bancos Únicos</p>
                <p className="text-2xl font-bold text-purple-900">{stats.bancos_unicos}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <IconBuilding className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-indigo-50 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600">Contribuyentes</p>
                <p className="text-2xl font-bold text-indigo-900">{stats.contribuyentes_unicos}</p>
              </div>
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <IconUsers className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h1 className="text-xl font-bold text-blue-900">Planillas de Recaudación 2024</h1>
          <div className="flex gap-2">
            <Button onClick={handleSearch} variant="default">
              <IconSearch className="h-4 w-4 mr-2" />
              Buscar
            </Button>
            <Button onClick={handleClearFilters} variant="outline">
              <IconRefresh className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros de búsqueda */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Filtros de Búsqueda</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filtro-rif">RIF Contribuyente</Label>
                <Input
                  id="filtro-rif"
                  placeholder="V-12345678-9"
                  value={filtroRif}
                  onChange={(e) => setFiltroRif(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="filtro-planilla">Código Planilla</Label>
                <Input
                  id="filtro-planilla"
                  placeholder="Código de planilla..."
                  value={filtroPlanilla}
                  onChange={(e) => setFiltroPlanilla(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="filtro-banco">Nombre Banco</Label>
                <Input
                  id="filtro-banco"
                  placeholder="Nombre del banco..."
                  value={filtroBanco}
                  onChange={(e) => setFiltroBanco(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="filtro-codigo-banco">Código Banco</Label>
                <Input
                  id="filtro-codigo-banco"
                  placeholder="0134"
                  value={filtroCodigoBanco}
                  onChange={(e) => setFiltroCodigoBanco(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="filtro-codigo-presupuestario">Código Presupuestario</Label>
                <Input
                  id="filtro-codigo-presupuestario"
                  placeholder="Código presupuestario..."
                  value={filtroCodigoPresupuestario}
                  onChange={(e) => setFiltroCodigoPresupuestario(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="filtro-designacion">Designación Presupuestaria</Label>
                <Input
                  id="filtro-designacion"
                  placeholder="Designación..."
                  value={filtroDesignacion}
                  onChange={(e) => setFiltroDesignacion(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="filtro-fecha-desde">Fecha Desde</Label>
                <Input
                  id="filtro-fecha-desde"
                  type="date"
                  value={filtroFechaDesde}
                  onChange={(e) => setFiltroFechaDesde(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="filtro-fecha-hasta">Fecha Hasta</Label>
                <Input
                  id="filtro-fecha-hasta"
                  type="date"
                  value={filtroFechaHasta}
                  onChange={(e) => setFiltroFechaHasta(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="filtro-monto-minimo">Monto Mínimo</Label>
                <Input
                  id="filtro-monto-minimo"
                  type="number"
                  placeholder="0.00"
                  value={filtroMontoMinimo}
                  onChange={(e) => setFiltroMontoMinimo(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="filtro-monto-maximo">Monto Máximo</Label>
                <Input
                  id="filtro-monto-maximo"
                  type="number"
                  placeholder="0.00"
                  value={filtroMontoMaximo}
                  onChange={(e) => setFiltroMontoMaximo(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Tabla de planillas */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <SkeletonTable />
            ) : (
              <div className="border rounded-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">RIF Contribuyente</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Código Planilla</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Fecha Transacción</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Monto Total</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Banco</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Código Banco</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Monto Concepto</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Código Presupuestario</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Designación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {planillas.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                            No se encontraron planillas de recaudación
                          </td>
                        </tr>
                      ) : (
                        planillas.map((planilla, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {planilla.rif_contribuyente}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 font-medium">{planilla.cod_seg_planilla}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{formatDate(planilla.fecha_trans)}</td>
                            <td className="px-4 py-3 font-semibold text-green-600">{formatCurrency(planilla.monto_total_trans)}</td>
                            <td className="px-4 py-3">{planilla.nombre_banco}</td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                {planilla.codigo_banco}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(planilla.monto_concepto)}</td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                {planilla.codigo_presupuestario}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 max-w-md">
                              <div className="truncate" title={planilla.designacion_presupuestario}>
                                {planilla.designacion_presupuestario}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Controles de Paginación */}
          {!isLoading && planillas.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.totalRecords)} de {pagination.totalRecords} registros
                </span>
                <select
                  value={pagination.limit}
                  onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value={500}>500 por página</option>
                  <option value={1000}>1000 por página</option>
                  <option value={2000}>2000 por página</option>
                  <option value={5000}>5000 por página</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handlePageChange(1)}
                  disabled={!pagination.hasPrevPage}
                  variant="outline"
                  size="sm"
                >
                  Primera
                </Button>
                <Button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                  variant="outline"
                  size="sm"
                >
                  Anterior
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i;
                    if (pageNum <= pagination.totalPages) {
                      return (
                        <Button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          variant={pageNum === pagination.page ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                    return null;
                  })}
                </div>

                <Button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  variant="outline"
                  size="sm"
                >
                  Siguiente
                </Button>
                <Button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={!pagination.hasNextPage}
                  variant="outline"
                  size="sm"
                >
                  Última
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 