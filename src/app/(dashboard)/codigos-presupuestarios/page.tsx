"use client";

import React, { useEffect, useState } from "react";
import {
  Table, TableHeader, TableRow, TableCell, TableBody,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { SkeletonTable } from "@/components/skeletons/tables/Table";
import ConfirmDialog from "@/components/ConfirmDialog";
import AddCodigoPresupuestarioModal from "@/components/AddCodigoPresupuestarioModal";
import EditCodigoPresupuestarioModal from "@/components/EditCodigoPresupuestarioModal";
import { CodigoPresupuestario, CodigoPresupuestarioStats } from "@/types/codigoPresupuestario";
import { IconSearch, IconPlus, IconRefresh, IconCalculator, IconDots, IconEdit, IconTrash } from "@tabler/icons-react";

export default function CodigosPresupuestariosPage() {
  const [codigos, setCodigos] = useState<CodigoPresupuestario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editCodigo, setEditCodigo] = useState<CodigoPresupuestario | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  
  // Filtros de búsqueda
  const [filtroCodigo, setFiltroCodigo] = useState("");
  const [filtroDesignacion, setFiltroDesignacion] = useState("");

  const fetchData = async (codigo?: string, designacion?: string) => {
    try {
      setIsLoading(true);
      
      // Construir URL con parámetros de búsqueda
      const params = new URLSearchParams();
      if (codigo) params.append('codigo', codigo);
      if (designacion) params.append('designacion', designacion);
      
      const url = `/api/codigos-presupuestarios${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Error cargando códigos presupuestarios");
      }

      const data = await response.json();
      setCodigos(data);
    } catch (err) {
      console.error(err);
      toast.error("Error cargando códigos presupuestarios");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Función para aplicar filtros
  const aplicarFiltros = () => {
    fetchData(filtroCodigo, filtroDesignacion);
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltroCodigo("");
    setFiltroDesignacion("");
    fetchData();
  };

  const handleEditSave = (updated: CodigoPresupuestario) => {
    setCodigos((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
    );
  };

  const deleteCodigo = async (id: number) => {
    try {
      const res = await fetch(`/api/codigos-presupuestarios/${id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        setCodigos((prev) => prev.filter((c) => c.id !== id));
        toast.success("Código presupuestario eliminado");
      } else {
        const error = await res.json();
        toast.error(error.error || "No se pudo eliminar el código");
      }
    } catch {
      toast.error("Error eliminando código presupuestario");
    }
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setOpenDelete(true);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteCodigo(deleteId);
      setOpenDelete(false);
      setDeleteId(null);
    }
  };

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const calculateStats = (): CodigoPresupuestarioStats => {
    const total = codigos.length;
    const completos = codigos.filter(c => 
      c.codigo_presupuestario && c.designacion_presupuestario
    ).length;
    
    return {
      total,
      porcentaje_completitud: total > 0 ? Math.round((completos / total) * 100) : 0
    };
  };

  const stats = calculateStats();

  // Calcular estadísticas
  const totalCodigos = codigos.length;
  const codigosConCodigo = codigos.filter(codigo => codigo.codigo_presupuestario && codigo.codigo_presupuestario.trim() !== '').length;
  const codigosSinCodigo = totalCodigos - codigosConCodigo;
  const porcentajeConCodigo = totalCodigos > 0 ? Math.round((codigosConCodigo / totalCodigos) * 100) : 0;

  return (
    <div className="p-6">
      {/* Dashboard de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Códigos</p>
                <p className="text-2xl font-bold text-blue-900">{totalCodigos}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Con Código</p>
                <p className="text-2xl font-bold text-green-900">{codigosConCodigo}</p>
                <p className="text-xs text-green-600">{porcentajeConCodigo}% del total</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Sin Código</p>
                <p className="text-2xl font-bold text-yellow-900">{codigosSinCodigo}</p>
                <p className="text-xs text-yellow-600">{totalCodigos > 0 ? Math.round((codigosSinCodigo / totalCodigos) * 100) : 0}% del total</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Última Actualización</p>
                <p className="text-lg font-bold text-purple-900">
                  {codigos.length > 0 ? formatDate(codigos[0]?.updatedAt) : 'N/A'}
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h1 className="text-xl font-bold text-blue-900">Gestión de Códigos Presupuestarios</h1>
          <Button onClick={() => setOpenAdd(true)}>
            Agregar Código
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filtros de búsqueda */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Filtros de Búsqueda</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filtro-codigo">Buscar por Código</Label>
                <Input
                  id="filtro-codigo"
                  value={filtroCodigo}
                  onChange={(e) => setFiltroCodigo(e.target.value)}
                  placeholder="Código presupuestario..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="filtro-designacion">Buscar por Designación</Label>
                <Input
                  id="filtro-designacion"
                  value={filtroDesignacion}
                  onChange={(e) => setFiltroDesignacion(e.target.value)}
                  placeholder="Designación presupuestaria..."
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
          </div>
          {/* Tabla de códigos presupuestarios */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <SkeletonTable />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell className="font-semibold">ID</TableCell>
                    <TableCell className="font-semibold">Código</TableCell>
                    <TableCell className="font-semibold">Designación</TableCell>
                    <TableCell className="font-semibold">Fecha Creación</TableCell>
                    <TableCell className="font-semibold">Fecha Actualización</TableCell>
                    <TableCell className="font-semibold text-right">Acciones</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {codigos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No se encontraron códigos presupuestarios
                      </TableCell>
                    </TableRow>
                  ) : (
                    codigos.map((codigo) => (
                      <TableRow key={codigo.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{codigo.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {codigo.codigo_presupuestario}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div className="truncate" title={codigo.designacion_presupuestario}>
                            {codigo.designacion_presupuestario}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{formatDate(codigo.createdAt)}</TableCell>
                        <TableCell className="text-sm text-gray-600">{formatDate(codigo.updatedAt)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <IconDots className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditCodigo(codigo);
                                  setOpenEdit(true);
                                }}
                              >
                                <IconEdit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => confirmDelete(codigo.id)}
                                className="text-red-600"
                              >
                                <IconTrash className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Modals */}
      <AddCodigoPresupuestarioModal
        open={openAdd}
        onOpenChange={setOpenAdd}
        onSuccess={() => fetchData()}
      />

      <EditCodigoPresupuestarioModal
        open={openEdit}
        onOpenChange={setOpenEdit}
        codigo={editCodigo}
        onSave={handleEditSave}
      />

      <ConfirmDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Eliminar Código Presupuestario"
        description="¿Estás seguro de que quieres eliminar este código presupuestario? Esta acción no se puede deshacer."
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
} 