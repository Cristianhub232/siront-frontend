import { DataTypes } from 'sequelize';
import sequelize from '@/lib/db';

// Tener en nombre en cuenta en CamelCase y snake_case
const RoleMenuPermission = sequelize.define('RoleMenuPermission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  roleId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'role_id', // 👈 campo físico en la tabla
  },
  menuId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'menu_id', 
  },
  canView: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'can_view', // 👈 muy importante
  },
  canEdit: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'can_edit', // 👈 muy importante
  },
}, {
  schema: 'public',
  tableName: 'role_menu_permissions',
  timestamps: false,
});

export default RoleMenuPermission;