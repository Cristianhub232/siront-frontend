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
import AddBancoModal from "@/components/AddBancoModal";
import EditBancoModal from "@/components/EditBancoModal";
import type { Banco } from "@/types/banco";

export default function ConsultaBancosPage() {
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editBanco, setEditBanco] = useState<Banco | null>(null);
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
      
      const url = `/api/bancos${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Error cargando bancos");
      }

      const data = await response.json();
      setBancos(data);
    } catch (err) {
      console.error(err);
      toast.error("Error cargando bancos");
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

  const handleEditSave = (updated: Banco) => {
    setBancos((prev) =>
      prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b))
    );
  };

  const deleteBanco = async (id: number) => {
    try {
      const res = await fetch(`/api/bancos/${id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        setBancos((prev) => prev.filter((b) => b.id !== id));
        toast.success("Banco eliminado");
      } else {
        const error = await res.json();
        toast.error(error.error || "No se pudo eliminar el banco");
      }
    } catch {
      toast.error("Error eliminando banco");
    }
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setOpenDelete(true);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteBanco(deleteId);
      setOpenDelete(false);
      setDeleteId(null);
    }
  };

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calcular estadísticas
  const totalBancos = bancos.length;
  const bancosConCodigo = bancos.filter(banco => banco.codigo_banco && banco.codigo_banco.trim() !== '').length;
  const bancosSinCodigo = totalBancos - bancosConCodigo;
  const porcentajeConCodigo = totalBancos > 0 ? Math.round((bancosConCodigo / totalBancos) * 100) : 0;

  return (
    <div className="p-6">
      {/* Dashboard de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Bancos</p>
                <p className="text-2xl font-bold text-blue-900">{totalBancos}</p>
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
                <p className="text-sm font-medium text-green-600">Con Código</p>
                <p className="text-2xl font-bold text-green-900">{bancosConCodigo}</p>
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
                <p className="text-2xl font-bold text-yellow-900">{bancosSinCodigo}</p>
                <p className="text-xs text-yellow-600">{totalBancos > 0 ? Math.round((bancosSinCodigo / totalBancos) * 100) : 0}% del total</p>
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
                  {bancos.length > 0 ? formatDate(bancos[0]?.updatedAt) : 'N/A'}
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
          <h1 className="text-xl font-bold text-blue-900">Gestión de Bancos</h1>
          <Button onClick={() => setOpenAdd(true)}>
            Agregar Banco
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
                  placeholder="Nombre del banco..."
                  onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filtro-codigo">Buscar por Código</Label>
                <Input
                  id="filtro-codigo"
                  value={filtroCodigo}
                  onChange={(e) => setFiltroCodigo(e.target.value)}
                  placeholder="Código del banco..."
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
            {bancos.length > 0 ? (
              <span>Mostrando {bancos.length} banco{bancos.length !== 1 ? 's' : ''}</span>
            ) : !isLoading && (
              <span>No se encontraron bancos</span>
            )}
          </div>

          {isLoading ? (
            <SkeletonTable />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Código</TableCell>
                  <TableCell>Nombre del Banco</TableCell>
                  <TableCell>Fecha Creación</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bancos.map((banco) => (
                  <TableRow key={banco.id}>
                    <TableCell>{banco.id}</TableCell>
                    <TableCell>{banco.codigo_banco}</TableCell>
                    <TableCell className="font-medium">{banco.nombre_banco}</TableCell>
                    <TableCell>{formatDate(banco.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline">Acciones</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onSelect={() => { 
                            setEditBanco(banco); 
                            setOpenEdit(true); 
                          }}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => confirmDelete(banco.id)}
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

      <EditBancoModal
        open={openEdit}
        onOpenChange={setOpenEdit}
        banco={editBanco}
        onSave={handleEditSave}
      />
      
      <ConfirmDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        onConfirm={handleConfirmDelete}
        title="Eliminar banco"
        description="¿Seguro que deseas eliminar este banco?"
        confirmLabel="Eliminar"
      />
      
      <AddBancoModal
        open={openAdd}
        onOpenChange={setOpenAdd}
        onSuccess={() => fetchData(filtroNombre, filtroCodigo)}
      />
    </div>
  );
} 