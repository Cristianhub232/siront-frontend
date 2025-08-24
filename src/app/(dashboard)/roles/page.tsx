"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Shield, Users, Eye, EyeOff, Settings } from "lucide-react";
import { AddRoleModal } from "@/components/AddRoleModal";
import { EditRoleModal } from "@/components/EditRoleModal";
import { RoleTable } from "@/components/RoleTable";

interface Role {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
  userCount?: number;
  permissions?: string[];
}

interface Menu {
  id: string;
  key: string;
  label: string;
  route: string;
  section: string;
  status: boolean;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Cargar roles
  const loadRoles = async () => {
    try {
      const response = await fetch('/api/admin/roles?all=true', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles || []);
      }
    } catch (error) {
      console.error('Error cargando roles:', error);
    }
  };

  // Cargar menús disponibles
  const loadMenus = async () => {
    try {
      const response = await fetch('/api/admin/menus', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMenus(data);
      }
    } catch (error) {
      console.error('Error cargando menús:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([loadRoles(), loadMenus()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleRoleCreated = () => {
    setShowAddModal(false);
    loadRoles();
  };

  const handleRoleUpdated = () => {
    setShowPermissionsModal(false);
    setSelectedRole(null);
    loadRoles();
  };

  const handleEditPermissions = (role: Role) => {
    setSelectedRole(role);
    setShowPermissionsModal(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setShowEditModal(true);
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Activo
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
        Inactivo
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Roles</h1>
          <p className="text-muted-foreground">
            Administra los roles del sistema y configura los permisos de acceso
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Crear Nuevo Rol
        </Button>
      </div>

      {/* Dashboard de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total de Roles</p>
                <p className="text-2xl font-bold text-blue-900">{roles.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Roles Activos</p>
                <p className="text-2xl font-bold text-green-900">
                  {roles.filter(role => role.status === 'active').length}
                </p>
                <p className="text-xs text-green-600">
                  {roles.length > 0 ? Math.round((roles.filter(role => role.status === 'active').length / roles.length) * 100) : 0}% del total
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Eye className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Módulos Disponibles</p>
                <p className="text-2xl font-bold text-purple-900">{menus.length}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Settings className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h1 className="text-xl font-bold text-blue-900">Roles del Sistema</h1>
        </CardHeader>
        <CardContent>
          <RoleTable 
            roles={roles} 
            onEditPermissions={handleEditPermissions}
            onRoleUpdated={loadRoles}
            onEditRole={handleEditRole}
          />
        </CardContent>
      </Card>

      {/* Modal para crear rol */}
      {showAddModal && (
        <AddRoleModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onRoleCreated={handleRoleCreated}
        />
      )}

      {/* Modal para editar rol */}
      {showEditModal && selectedRole && (
        <EditRoleModal
          role={selectedRole}
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onRoleUpdated={handleRoleUpdated}
        />
      )}

      {/* Modal para configurar permisos */}
      {showPermissionsModal && selectedRole && (
        <RolePermissionsModal
          role={selectedRole}
          menus={menus}
          open={showPermissionsModal}
          onClose={() => setShowPermissionsModal(false)}
          onPermissionsUpdated={handleRoleUpdated}
        />
      )}
    </div>
  );
}

// Componente para configurar permisos de rol
interface RolePermissionsModalProps {
  role: Role;
  menus: Menu[];
  open: boolean;
  onClose: () => void;
  onPermissionsUpdated: () => void;
}

function RolePermissionsModal({ role, menus, open, onClose, onPermissionsUpdated }: RolePermissionsModalProps) {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Cargar permisos actuales del rol
  useEffect(() => {
    if (open && role) {
      loadCurrentPermissions();
    }
  }, [open, role]);

  const loadCurrentPermissions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/roles/${role.id}/permissions`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        const permissionsMap: Record<string, boolean> = {};
        data.permissions?.forEach((perm: any) => {
          permissionsMap[perm.menu_id] = perm.can_view;
        });
        setPermissions(permissionsMap);
      }
    } catch (error) {
      console.error('Error cargando permisos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (menuId: string, canView: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [menuId]: canView
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const permissionsArray = Object.entries(permissions).map(([menuId, canView]) => ({
        menu_id: menuId,
        can_view: canView,
        can_edit: false // Por ahora solo configuramos vista
      }));

      const response = await fetch(`/api/admin/roles/${role.id}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ permissions: permissionsArray })
      });

      if (response.ok) {
        onPermissionsUpdated();
      } else {
        console.error('Error guardando permisos');
      }
    } catch (error) {
      console.error('Error guardando permisos:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Configurar Permisos - {role.name}</h2>
          <Button variant="outline" onClick={onClose}>✕</Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Selecciona qué módulos puede ver este rol. Los usuarios con este rol solo tendrán acceso a los módulos marcados.
              </p>
            </div>

            <div className="grid gap-4">
              {menus.map((menu) => (
                <div key={menu.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`menu-${menu.id}`}
                        checked={permissions[menu.id] || false}
                        onChange={(e) => handlePermissionChange(menu.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={`menu-${menu.id}`} className="font-medium cursor-pointer">
                        {menu.label}
                      </label>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {menu.section}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {menu.route}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Permisos'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 