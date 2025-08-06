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
import AddFormaModal from "@/components/AddFormaModal";
import EditFormaModal from "@/components/EditFormaModal";
import type { Forma } from "@/types/forma";

export default function ConsultaFormasPage() {
  const [formas, setFormas] = useState<Forma[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editForma, setEditForma] = useState<Forma | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  
  // Filtros de búsqueda
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroCodigo, setFiltroCodigo] = useState("");

  const fetchData = async (nombre?: string, codigo?: string) => {
    try {
      setIsLoading(true);
      
      // Construir URL con parámetros de búsqueda
      const params = new URLSearchParams();
      if (nombre) params.append('nombre', nombre);
      if (codigo) params.append('codigo', codigo);
      
      const url = `/api/formas${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Error cargando formas");
      }

      const data = await response.json();
      setFormas(data);
    } catch (err) {
      console.error(err);
      toast.error("Error cargando formas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Función para aplicar filtros
  const aplicarFiltros = () => {
    fetchData(filtroNombre, filtroCodigo);
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltroNombre("");
    setFiltroCodigo("");
    fetchData();
  };

  const handleEditSave = (updated: Forma) => {
    setFormas((prev) =>
      prev.map((f) => (f.id === updated.id ? { ...f, ...updated } : f))
    );
  };

  const deleteForma = async (id: number) => {
    try {
      const res = await fetch(`/api/formas/${id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        setFormas((prev) => prev.filter((f) => f.id !== id));
        toast.success("Forma eliminada");
      } else {
        const error = await res.json();
        toast.error(error.error || "No se pudo eliminar la forma");
      }
    } catch {
      toast.error("Error eliminando forma");
    }
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setOpenDelete(true);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteForma(deleteId);
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
  const totalFormas = formas.length;
  const formasConCodigo = formas.filter(f => f.codigo_forma && f.codigo_forma.trim() !== '').length;
  const formasSinCodigo = totalFormas - formasConCodigo;
  const porcentajeConCodigo = totalFormas > 0 ? Math.round((formasConCodigo / totalFormas) * 100) : 0;

  return (
    <div className="p-6">
      {/* Dashboard de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Formas</p>
                <p className="text-2xl font-bold text-blue-900">{totalFormas}</p>
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
                <p className="text-sm font-medium text-green-600">Con Código</p>
                <p className="text-2xl font-bold text-green-900">{formasConCodigo}</p>
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
                <p className="text-2xl font-bold text-yellow-900">{formasSinCodigo}</p>
                <p className="text-xs text-yellow-600">{totalFormas > 0 ? Math.round((formasSinCodigo / totalFormas) * 100) : 0}% del total</p>
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
                  {formas.length > 0 ? formatDate(formas[0]?.updatedAt) : 'N/A'}
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
          <h1 className="text-xl font-bold text-blue-900">Gestión de Formas</h1>
          <Button onClick={() => setOpenAdd(true)}>
            Agregar Forma
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
                  placeholder="Nombre de la forma..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filtro-codigo">Buscar por Código</Label>
                <Input
                  id="filtro-codigo"
                  value={filtroCodigo}
                  onChange={(e) => setFiltroCodigo(e.target.value)}
                  placeholder="Código de la forma..."
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

          {/* Tabla */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Lista de Formas</h3>
            {isLoading ? (
              <SkeletonTable />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Nombre de la Forma</TableCell>
                    <TableCell>Código</TableCell>
                    <TableCell>Fecha Creación</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No se encontraron formas
                      </TableCell>
                    </TableRow>
                  ) : (
                    formas.map((forma) => (
                      <TableRow key={forma.id}>
                        <TableCell>{forma.id}</TableCell>
                        <TableCell className="font-medium">{forma.nombre_forma}</TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">{forma.codigo_forma}</span>
                        </TableCell>
                        <TableCell>{formatDate(forma.createdAt)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditForma(forma);
                                  setOpenEdit(true);
                                }}
                              >
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => confirmDelete(forma.id)}
                                className="text-red-600"
                              >
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

      {/* Modales */}
      <AddFormaModal
        open={openAdd}
        onOpenChange={setOpenAdd}
        onSuccess={() => {
          fetchData();
          setOpenAdd(false);
        }}
      />

      <EditFormaModal
        open={openEdit}
        onOpenChange={setOpenEdit}
        forma={editForma}
        onSave={handleEditSave}
      />

      <ConfirmDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Eliminar Forma"
        description="¿Estás seguro de que quieres eliminar esta forma? Esta acción no se puede deshacer."
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
} 