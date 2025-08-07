'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconSearch, IconRefresh, IconFileText, IconCalendar } from '@tabler/icons-react';
import { PlanillaRecaudacion, PlanillaRecaudacionFilters, PlanillaRecaudacionStats, PaginationInfo } from '@/types/planillaRecaudacion';
import { SkeletonTable } from '@/components/skeletons/tables/Table';

export default function PlanillasRecaudacionPage() {
  const [planillas, setPlanillas] = useState<PlanillaRecaudacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PlanillaRecaudacionStats>({
    total_planillas: 0,
    monto_total: 0,
    bancos_unicos: 0,
    contribuyentes_unicos: 0,
    formas_unicas: 0,
    promedio_monto: 0
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 25,
    totalRecords: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Estados para filtros
  const [filtroRif, setFiltroRif] = useState('');
  const [filtroCodigoPlanilla, setFiltroCodigoPlanilla] = useState('');
  const [filtroNombreBanco, setFiltroNombreBanco] = useState('');
  const [filtroCodigoBanco, setFiltroCodigoBanco] = useState('');
  const [filtroNombreForma, setFiltroNombreForma] = useState('');
  const [filtroCodigoForma, setFiltroCodigoForma] = useState('');
  const [filtroCodigoPresupuestario, setFiltroCodigoPresupuestario] = useState('');
  const [filtroDesignacion, setFiltroDesignacion] = useState('');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');
  const [filtroMontoMinimo, setFiltroMontoMinimo] = useState('');
  const [filtroMontoMaximo, setFiltroMontoMaximo] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount) + ' Bs';
  };

  const fetchPlanillas = async (page = 1, limit = 25) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      // Agregar filtros si están definidos
      if (filtroRif) params.append('rif_contribuyente', filtroRif);
      if (filtroCodigoPlanilla) params.append('cod_seg_planilla', filtroCodigoPlanilla);
      if (filtroNombreBanco) params.append('nombre_banco', filtroNombreBanco);
      if (filtroCodigoBanco) params.append('codigo_banco', filtroCodigoBanco);
      if (filtroNombreForma) params.append('nombre_forma', filtroNombreForma);
      if (filtroCodigoForma) params.append('codigo_forma', filtroCodigoForma);
      if (filtroCodigoPresupuestario) params.append('codigo_presupuestario', filtroCodigoPresupuestario);
      if (filtroDesignacion) params.append('designacion_presupuestario', filtroDesignacion);
      if (filtroFechaDesde) params.append('fecha_desde', filtroFechaDesde);
      if (filtroFechaHasta) params.append('fecha_hasta', filtroFechaHasta);
      if (filtroMontoMinimo) params.append('monto_minimo', filtroMontoMinimo);
      if (filtroMontoMaximo) params.append('monto_maximo', filtroMontoMaximo);

      const response = await fetch(`/api/planillas-recaudacion?${params}`);
      const result = await response.json();

      if (result.success) {
        console.log('API Response data:', result.data);
        console.log('Data length:', result.data.length);
        setPlanillas(result.data);
        setStats(result.stats);
        setPagination(result.pagination);
      } else {
        console.error('Error en la respuesta:', result.error);
      }
    } catch (error) {
      console.error('Error al obtener planillas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchPlanillas(1, pagination.limit);
  };

  const handleClearFilters = () => {
    setFiltroRif('');
    setFiltroCodigoPlanilla('');
    setFiltroNombreBanco('');
    setFiltroCodigoBanco('');
    setFiltroNombreForma('');
    setFiltroCodigoForma('');
    setFiltroCodigoPresupuestario('');
    setFiltroDesignacion('');
    setFiltroFechaDesde('');
    setFiltroFechaHasta('');
    setFiltroMontoMinimo('');
    setFiltroMontoMaximo('');
    fetchPlanillas(1, pagination.limit);
  };

  const handlePageChange = (newPage: number) => {
    fetchPlanillas(newPage, pagination.limit);
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit }));
    fetchPlanillas(1, newLimit);
  };

  useEffect(() => {
    fetchPlanillas();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Planillas de Recaudación 2024</h1>
        <p className="text-gray-600 mt-2">Consulta y gestión de planillas de recaudación</p>
      </div>

      <div className="p-6">
        {/* Dashboard de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
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
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconSearch className="w-5 h-5" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label htmlFor="filtro-rif" className="block text-sm font-medium text-gray-700 mb-1">
                  RIF Contribuyente
                </label>
                <Input
                  id="filtro-rif"
                  placeholder="RIF..."
                  value={filtroRif}
                  onChange={(e) => setFiltroRif(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="filtro-codigo-planilla" className="block text-sm font-medium text-gray-700 mb-1">
                  Código Planilla
                </label>
                <Input
                  id="filtro-codigo-planilla"
                  placeholder="Código planilla..."
                  value={filtroCodigoPlanilla}
                  onChange={(e) => setFiltroCodigoPlanilla(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="filtro-nombre-banco" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Banco
                </label>
                <Input
                  id="filtro-nombre-banco"
                  placeholder="Nombre banco..."
                  value={filtroNombreBanco}
                  onChange={(e) => setFiltroNombreBanco(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="filtro-codigo-banco" className="block text-sm font-medium text-gray-700 mb-1">
                  Código Banco
                </label>
                <Input
                  id="filtro-codigo-banco"
                  placeholder="Código banco..."
                  value={filtroCodigoBanco}
                  onChange={(e) => setFiltroCodigoBanco(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="filtro-nombre-forma" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Forma
                </label>
                <Input
                  id="filtro-nombre-forma"
                  placeholder="Nombre forma..."
                  value={filtroNombreForma}
                  onChange={(e) => setFiltroNombreForma(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="filtro-codigo-forma" className="block text-sm font-medium text-gray-700 mb-1">
                  Código Forma
                </label>
                <Input
                  id="filtro-codigo-forma"
                  placeholder="Código forma..."
                  value={filtroCodigoForma}
                  onChange={(e) => setFiltroCodigoForma(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="filtro-codigo-presupuestario" className="block text-sm font-medium text-gray-700 mb-1">
                  Código Presupuestario
                </label>
                <Input
                  id="filtro-codigo-presupuestario"
                  placeholder="Código presupuestario..."
                  value={filtroCodigoPresupuestario}
                  onChange={(e) => setFiltroCodigoPresupuestario(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="filtro-designacion" className="block text-sm font-medium text-gray-700 mb-1">
                  Designación
                </label>
                <Input
                  id="filtro-designacion"
                  placeholder="Designación..."
                  value={filtroDesignacion}
                  onChange={(e) => setFiltroDesignacion(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="filtro-fecha-desde" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Desde
                </label>
                <Input
                  id="filtro-fecha-desde"
                  type="date"
                  value={filtroFechaDesde}
                  onChange={(e) => setFiltroFechaDesde(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="filtro-fecha-hasta" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Hasta
                </label>
                <Input
                  id="filtro-fecha-hasta"
                  type="date"
                  value={filtroFechaHasta}
                  onChange={(e) => setFiltroFechaHasta(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="filtro-monto-minimo" className="block text-sm font-medium text-gray-700 mb-1">
                  Monto Mínimo
                </label>
                <Input
                  id="filtro-monto-minimo"
                  type="number"
                  placeholder="Monto mínimo..."
                  value={filtroMontoMinimo}
                  onChange={(e) => setFiltroMontoMinimo(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="filtro-monto-maximo" className="block text-sm font-medium text-gray-700 mb-1">
                  Monto Máximo
                </label>
                <Input
                  id="filtro-monto-maximo"
                  type="number"
                  placeholder="Monto máximo..."
                  value={filtroMontoMaximo}
                  onChange={(e) => setFiltroMontoMaximo(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} className="flex items-center gap-2">
                <IconSearch className="w-4 h-4" />
                Buscar
              </Button>
              <Button variant="outline" onClick={handleClearFilters} className="flex items-center gap-2">
                <IconRefresh className="w-4 h-4" />
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabla */}
        <Card>
          <CardHeader>
            <CardTitle>Planillas de Recaudación</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SkeletonTable />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-2 py-1 text-left font-medium text-xs">RIF</th>
                      <th className="border border-gray-300 px-2 py-1 text-left font-medium text-xs">Código Planilla</th>
                      <th className="border border-gray-300 px-2 py-1 text-left font-medium text-xs">Número Planilla</th>
                      <th className="border border-gray-300 px-2 py-1 text-left font-medium text-xs">Fecha</th>
                      <th className="border border-gray-300 px-2 py-1 text-left font-medium text-xs">Monto Total</th>
                      <th className="border border-gray-300 px-2 py-1 text-left font-medium text-xs">Monto Concepto</th>
                      <th className="border border-gray-300 px-2 py-1 text-left font-medium text-xs">Código Presupuestario</th>
                      <th className="border border-gray-300 px-2 py-1 text-left font-medium text-xs">Designación</th>
                      <th className="border border-gray-300 px-2 py-1 text-left font-medium text-xs">Código Forma</th>
                      <th className="border border-gray-300 px-2 py-1 text-left font-medium text-xs">Nombre Forma</th>
                      <th className="border border-gray-300 px-2 py-1 text-left font-medium text-xs">Código Banco</th>
                      <th className="border border-gray-300 px-2 py-1 text-left font-medium text-xs">Nombre Banco</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planillas.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="border border-gray-300 px-2 py-4 text-center text-gray-500 text-xs">
                          No se encontraron planillas
                        </td>
                      </tr>
                    ) : (
                      planillas.map((planilla, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1 text-xs">{planilla.rif_contribuyente}</td>
                          <td className="border border-gray-300 px-2 py-1 text-xs">{planilla.cod_seg_planilla}</td>
                          <td className="border border-gray-300 px-2 py-1 text-xs">{planilla.num_planilla || '-'}</td>
                          <td className="border border-gray-300 px-2 py-1 text-xs">
                            {new Date(planilla.fecha_trans).toLocaleDateString('es-VE')}
                          </td>
                          <td className="border border-gray-300 px-2 py-1 font-medium text-xs">
                            {formatCurrency(planilla.monto_total_trans)}
                          </td>
                          <td className="border border-gray-300 px-2 py-1 text-xs">
                            {planilla.monto_concepto ? formatCurrency(planilla.monto_concepto) : '-'}
                          </td>
                          <td className="border border-gray-300 px-2 py-1 text-xs">
                            {planilla.codigo_presupuestario || '-'}
                          </td>
                          <td className="border border-gray-300 px-2 py-1 text-xs">
                            {planilla.designacion_presupuestario || '-'}
                          </td>
                          <td className="border border-gray-300 px-2 py-1 text-xs">
                            {planilla.codigo_forma || '-'}
                          </td>
                          <td className="border border-gray-300 px-2 py-1 text-xs">
                            {planilla.nombre_forma || '-'}
                          </td>
                          <td className="border border-gray-300 px-2 py-1 text-xs">
                            {planilla.codigo_banco || '-'}
                          </td>
                          <td className="border border-gray-300 px-2 py-1 text-xs">
                            {planilla.nombre_banco || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Paginación */}
            {!loading && planillas.length > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-700">
                    Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.totalRecords)} de{' '}
                    {pagination.totalRecords.toLocaleString()} registros
                  </span>
                  <select
                    value={pagination.limit}
                    onChange={(e) => handleLimitChange(Number(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-3 py-2 text-sm">
                    Página {pagination.page} de {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
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
    </div>
  );
} 