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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Códigos Presupuestarios</h1>
          <p className="text-muted-foreground">
            Gestiona los códigos presupuestarios del sistema
          </p>
        </div>
        <Button onClick={() => setOpenAdd(true)}>
          <IconPlus className="h-4 w-4 mr-2" />
          Agregar Código
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardContent className="text-sm font-medium">Total Códigos</CardContent>
            <IconCalculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Códigos registrados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardContent className="text-sm font-medium">Completitud</CardContent>
            <IconCalculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.porcentaje_completitud}%</div>
            <p className="text-xs text-muted-foreground">
              Datos completos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardContent className="text-sm font-medium">Última Actualización</CardContent>
            <IconCalculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {codigos.length > 0 ? formatDate(codigos[0].updatedAt) : "-"}
            </div>
            <p className="text-xs text-muted-foreground">
              Registro más reciente
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardContent className="text-sm font-medium">Estado</CardContent>
            <IconCalculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant="secondary">Activo</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Sistema funcionando
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Filtros de Búsqueda</h3>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="filtro-codigo">Código Presupuestario</Label>
              <Input
                id="filtro-codigo"
                placeholder="Buscar por código..."
                value={filtroCodigo}
                onChange={(e) => setFiltroCodigo(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filtro-designacion">Designación</Label>
              <Input
                id="filtro-designacion"
                placeholder="Buscar por designación..."
                value={filtroDesignacion}
                onChange={(e) => setFiltroDesignacion(e.target.value)}
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

      {/* Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Lista de Códigos Presupuestarios</h3>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SkeletonTable />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Código Presupuestario</TableCell>
                  <TableCell>Designación Presupuestaria</TableCell>
                  <TableCell>Fecha Creación</TableCell>
                  <TableCell>Fecha Actualización</TableCell>
                  <TableCell className="text-right">Acciones</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codigos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No se encontraron códigos presupuestarios
                    </TableCell>
                  </TableRow>
                ) : (
                  codigos.map((codigo) => (
                    <TableRow key={codigo.id}>
                      <TableCell>{codigo.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{codigo.codigo_presupuestario}</Badge>
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {codigo.designacion_presupuestario}
                      </TableCell>
                      <TableCell>{formatDate(codigo.createdAt)}</TableCell>
                      <TableCell>{formatDate(codigo.updatedAt)}</TableCell>
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