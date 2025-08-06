"use client"

import { useState } from "react"
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import ConfirmDialog from "@/components/ConfirmDialog"
import { toast } from "sonner"
import type { Role } from "@/types/role"

interface RoleTableProps {
  roles: Role[]
  onUpdate: (role: Role) => void
  onDelete: (id: string) => void
}

export default function RoleTable({ roles, onUpdate, onDelete }: RoleTableProps) {
  const [editing, setEditing] = useState<Record<string, string>>({})
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const saveName = async (id: string) => {
    const name = editing[id]?.trim()
    if (!name || roles.find(r => r.id === id)?.name === name) return
    try {
      const res = await fetch(`/api/admin/roles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      })
      if (res.ok) {
        onUpdate({ ...(roles.find(r => r.id === id)!), name })
        toast.success("Rol actualizado")
        setEditing(prev => { const c = { ...prev }; delete c[id]; return c })
      } else {
        const err = await res.json()
        toast.error(err.error || "Error actualizando rol")
      }
    } catch {
      toast.error("Error actualizando rol")
    }
  }

  const toggleStatus = async (id: string, checked: boolean) => {
    const status = checked ? "activo" : "inactivo"
    try {
      const res = await fetch(`/api/admin/roles/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        onUpdate({ ...(roles.find(r => r.id === id)!), status })
        toast.success("Estado actualizado")
      } else {
        const err = await res.json()
        toast.error(err.error || "Error actualizando estado")
      }
    } catch {
      toast.error("Error actualizando estado")
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/admin/roles/${deleteId}`, { method: "DELETE" })
      if (res.status === 204) {
        onDelete(deleteId)
        toast.success("Rol eliminado")
      } else {
        const err = await res.json()
        toast.error(err.error || "No se pudo eliminar el rol")
      }
    } catch {
      toast.error("Error eliminando rol")
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Activo</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map(role => (
            <TableRow key={role.id}>
              <TableCell>
                <Input
                  value={editing[role.id] ?? role.name}
                  onChange={e => setEditing(prev => ({ ...prev, [role.id]: e.target.value }))}
                  onBlur={() => saveName(role.id)}
                />
              </TableCell>
              <TableCell>
                <Checkbox
                  checked={role.status === "activo"}
                  onCheckedChange={checked => toggleStatus(role.id, !!checked)}
                />
              </TableCell>
              <TableCell>
                <Button size="sm" variant="destructive" onClick={() => setDeleteId(role.id)}>
                  Eliminar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={open => { if (!open) setDeleteId(null) }}
        onConfirm={handleDelete}
        title="Eliminar rol"
        description="¿Seguro que deseas eliminar este rol?"
        confirmLabel="Eliminar"
      />
    </>
  )
}
