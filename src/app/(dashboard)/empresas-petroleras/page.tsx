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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { SkeletonTable } from "@/components/skeletons/tables/Table";
import ConfirmDialog from "@/components/ConfirmDialog";
import AddEmpresaModal from "@/components/AddEmpresaModal";
import EditEmpresaModal from "@/components/EditEmpresaModal";
import type { EmpresaPetrolera } from "@/types/empresaPetrolera";

export default function EmpresasPetrolerasPage() {
  const [empresas, setEmpresas] = useState<EmpresaPetrolera[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editEmpresa, setEditEmpresa] = useState<EmpresaPetrolera | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  
  // Filtros de búsqueda
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroRif, setFiltroRif] = useState("");

  const fetchData = async (nombre?: string, rif?: string) => {
    try {
      setIsLoading(true);
      
      // Construir URL con parámetros de búsqueda
      const params = new URLSearchParams();
      if (nombre) params.append('nombre', nombre);
      if (rif) params.append('rif', rif);
      
      const url = `/api/empresas-petroleras${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Error cargando empresas petroleras");
      }

      const data = await response.json();
      setEmpresas(data);
    } catch (err) {
      console.error(err);
      toast.error("Error cargando empresas petroleras");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Función para aplicar filtros
  const aplicarFiltros = () => {
    fetchData(filtroNombre, filtroRif);
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltroNombre("");
    setFiltroRif("");
    fetchData();
  };

  const handleEditSave = (updated: EmpresaPetrolera) => {
    setEmpresas((prev) =>
      prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e))
    );
  };

  const deleteEmpresa = async (id: number) => {
    try {
      const res = await fetch(`/api/empresas-petroleras/${id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        setEmpresas((prev) => prev.filter((e) => e.id !== id));
        toast.success("Empresa petrolera eliminada");
      } else {
        const error = await res.json();
        toast.error(error.error || "No se pudo eliminar la empresa");
      }
    } catch {
      toast.error("Error eliminando empresa petrolera");
    }
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setOpenDelete(true);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteEmpresa(deleteId);
    }
    setOpenDelete(false);
    setDeleteId(null);
  };

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  // Calcular estadísticas
  const totalEmpresas = empresas.length;
  const empresasConRif = empresas.filter(emp => emp.rif && emp.rif.trim() !== '').length;
  const empresasSinRif = totalEmpresas - empresasConRif;
  const porcentajeConRif = totalEmpresas > 0 ? Math.round((empresasConRif / totalEmpresas) * 100) : 0;

  return (
    <div className="p-6">
      {/* Dashboard de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Empresas</p>
                <p className="text-2xl font-bold text-blue-900">{totalEmpresas}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Con RIF</p>
                <p className="text-2xl font-bold text-green-900">{empresasConRif}</p>
                <p className="text-xs text-green-600">{porcentajeConRif}% del total</p>
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
                <p className="text-sm font-medium text-yellow-600">Sin RIF</p>
                <p className="text-2xl font-bold text-yellow-900">{empresasSinRif}</p>
                <p className="text-xs text-yellow-600">{totalEmpresas > 0 ? Math.round((empresasSinRif / totalEmpresas) * 100) : 0}% del total</p>
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
                  {empresas.length > 0 ? formatDate(empresas[0]?.fecha_actualizacion) : 'N/A'}
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
          <h1 className="text-xl font-bold text-blue-900">Gestión de Empresas Petroleras</h1>
          <Button onClick={() => setOpenAdd(true)}>
            Agregar Empresa
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filtros de búsqueda */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Filtros de Búsqueda</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filtro-nombre">Buscar por Nombre</Label>
                <Input
                  id="filtro-nombre"
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                  placeholder="Nombre de la empresa..."
                  onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filtro-rif">Buscar por RIF</Label>
                <Input
                  id="filtro-rif"
                  value={filtroRif}
                  onChange={(e) => setFiltroRif(e.target.value)}
                  placeholder="RIF de la empresa..."
                  onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
                />
              </div>
              <div className="flex items-end space-x-2">
                <Button onClick={aplicarFiltros} className="flex-1">
                  Buscar
                </Button>
                <Button onClick={limpiarFiltros} variant="outline">
                  Limpiar
                </Button>
              </div>
            </div>
          </div>

          {/* Información de resultados */}
          <div className="mb-4 text-sm text-gray-600">
            {empresas.length > 0 ? (
              <span>Mostrando {empresas.length} empresa{empresas.length !== 1 ? 's' : ''}</span>
            ) : !isLoading && (
              <span>No se encontraron empresas petroleras</span>
            )}
          </div>

          {isLoading ? (
            <SkeletonTable />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Número</TableCell>
                  <TableCell>Nombre de la Empresa</TableCell>
                  <TableCell>RIF</TableCell>
                  <TableCell>Fecha Creación</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {empresas.map((empresa) => (
                  <TableRow key={empresa.id}>
                    <TableCell>{empresa.numero}</TableCell>
                    <TableCell className="font-medium">{empresa.nombre_empresa}</TableCell>
                    <TableCell>{empresa.rif || "-"}</TableCell>
                    <TableCell>{formatDate(empresa.fecha_creacion)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline">Acciones</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onSelect={() => { 
                            setEditEmpresa(empresa); 
                            setOpenEdit(true); 
                          }}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => confirmDelete(empresa.id)}
                          >
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <EditEmpresaModal
        open={openEdit}
        onOpenChange={setOpenEdit}
        empresa={editEmpresa}
        onSave={handleEditSave}
      />
      
      <ConfirmDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        onConfirm={handleConfirmDelete}
        title="Eliminar empresa petrolera"
        description="¿Seguro que deseas eliminar esta empresa petrolera?"
        confirmLabel="Eliminar"
      />
      
      <AddEmpresaModal
        open={openAdd}
        onOpenChange={setOpenAdd}
        onSuccess={() => fetchData(filtroNombre, filtroRif)}
      />
    </div>
  );
} 