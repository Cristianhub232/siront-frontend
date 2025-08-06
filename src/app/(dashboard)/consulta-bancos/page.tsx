'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, RefreshCw, Building2 } from '@tabler/icons-react';
import AddBancoModal from '@/components/AddBancoModal';
import EditBancoModal from '@/components/EditBancoModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Banco, BancoStats } from '@/types/banco';

export default function ConsultaBancosPage() {
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [stats, setStats] = useState<BancoStats>({
    total: 0,
    con_descripcion: 0,
    sin_descripcion: 0,
    porcentaje_completitud: 0
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    nombre: '',
    codigo: '',
    tipo: ''
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBanco, setSelectedBanco] = useState<Banco | null>(null);

  // Cargar bancos
  const loadBancos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.nombre) params.append('nombre', filters.nombre);
      if (filters.codigo) params.append('codigo', filters.codigo);
      if (filters.tipo) params.append('tipo', filters.tipo);

      const response = await fetch(`/api/bancos?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setBancos(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Error al cargar bancos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas
  const calculateStats = (data: Banco[]) => {
    const total = data.length;
    const conDescripcion = data.filter(b => b.descripcion && b.descripcion.trim() !== '').length;
    const sinDescripcion = total - conDescripcion;
    const porcentaje = total > 0 ? Math.round((conDescripcion / total) * 100) : 0;

    setStats({
      total,
      con_descripcion: conDescripcion,
      sin_descripcion: sinDescripcion,
      porcentaje_completitud: porcentaje
    });
  };

  // Aplicar filtros
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    loadBancos();
  };

  const handleClearFilters = () => {
    setFilters({ nombre: '', codigo: '', tipo: '' });
  };

  // CRUD Operations
  const handleAddBanco = async (bancoData: any) => {
    try {
      const response = await fetch('/api/bancos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bancoData)
      });

      if (response.ok) {
        setShowAddModal(false);
        loadBancos();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al crear banco');
      }
    } catch (error) {
      console.error('Error al crear banco:', error);
      alert('Error al crear banco');
    }
  };

  const handleEditBanco = async (bancoData: any) => {
    if (!selectedBanco) return;

    try {
      const response = await fetch(`/api/bancos/${selectedBanco.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bancoData)
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedBanco(null);
        loadBancos();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al actualizar banco');
      }
    } catch (error) {
      console.error('Error al actualizar banco:', error);
      alert('Error al actualizar banco');
    }
  };

  const handleDeleteBanco = async () => {
    if (!selectedBanco) return;

    try {
      const response = await fetch(`/api/bancos/${selectedBanco.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setShowDeleteDialog(false);
        setSelectedBanco(null);
        loadBancos();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al eliminar banco');
      }
    } catch (error) {
      console.error('Error al eliminar banco:', error);
      alert('Error al eliminar banco');
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadBancos();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Consulta de Bancos</h1>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Agregar Banco</span>
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bancos</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Descripción</CardTitle>
            <Badge variant="default" className="bg-green-100 text-green-800">
              {stats.con_descripcion}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.con_descripcion}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Descripción</CardTitle>
            <Badge variant="destructive" className="bg-red-100 text-red-800">
              {stats.sin_descripcion}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.sin_descripcion}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completitud</CardTitle>
            <Badge variant="outline">{stats.porcentaje_completitud}%</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.porcentaje_completitud}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre del Banco</label>
              <Input
                placeholder="Buscar por nombre..."
                value={filters.nombre}
                onChange={(e) => handleFilterChange('nombre', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Código</label>
              <Input
                placeholder="Buscar por código..."
                value={filters.codigo}
                onChange={(e) => handleFilterChange('codigo', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Input
                placeholder="Filtrar por tipo..."
                value={filters.tipo}
                onChange={(e) => handleFilterChange('tipo', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            <Button onClick={handleSearch} className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Buscar</span>
            </Button>
            <Button variant="outline" onClick={handleClearFilters}>
              Limpiar Filtros
            </Button>
            <Button variant="outline" onClick={loadBancos} className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4" />
              <span>Actualizar</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Bancos */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Bancos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Cargando bancos...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha Creación</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bancos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No se encontraron bancos
                      </TableCell>
                    </TableRow>
                  ) : (
                    bancos.map((banco) => (
                      <TableRow key={banco.id}>
                        <TableCell>{banco.id}</TableCell>
                        <TableCell>{banco.codigo || '-'}</TableCell>
                        <TableCell className="font-medium">{banco.nombre}</TableCell>
                        <TableCell>
                          {banco.descripcion ? (
                            <span className="text-sm text-gray-600">
                              {banco.descripcion.length > 50 
                                ? `${banco.descripcion.substring(0, 50)}...` 
                                : banco.descripcion}
                            </span>
                          ) : (
                            <Badge variant="outline" className="text-red-600 border-red-300">
                              Sin descripción
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{banco.tipo || '-'}</TableCell>
                        <TableCell>
                          {banco.fecha_creacion 
                            ? new Date(banco.fecha_creacion).toLocaleDateString('es-ES')
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedBanco(banco);
                                setShowEditModal(true);
                              }}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedBanco(banco);
                                setShowDeleteDialog(true);
                              }}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modales */}
      <AddBancoModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddBanco}
      />

      <EditBancoModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedBanco(null);
        }}
        onSubmit={handleEditBanco}
        banco={selectedBanco}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedBanco(null);
        }}
        onConfirm={handleDeleteBanco}
        title="Eliminar Banco"
        message={`¿Estás seguro de que quieres eliminar el banco "${selectedBanco?.nombre}"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
} 