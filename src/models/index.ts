// models/index.ts
import Menu from './Menu';
import Role from './Role';
import User from './User';
import RoleMenuPermission from './RoleMenuPermission';
import EmpresaPetrolera from './EmpresaPetrolera';
import Forma from './Forma';

// 🔗 Asociaciones centralizadas

// Menús y permisos
Menu.hasMany(RoleMenuPermission, {
  foreignKey: 'menu_id',
  as: 'permissions',
});
RoleMenuPermission.belongsTo(Menu, {
  foreignKey: 'menu_id',
  as: 'menu',
});
RoleMenuPermission.belongsTo(Role, {
  foreignKey: 'role_id',
  as: 'role',
});

// Roles y usuarios
Role.hasMany(User, {
  foreignKey: 'role_id',
  as: 'users',
});
User.belongsTo(Role, {
  foreignKey: 'role_id',
  as: 'role',
});

Menu.hasMany(Menu, {
  foreignKey: 'parentId',
  as: 'children',
});

Menu.belongsTo(Menu, {
  foreignKey: 'parentId',
  as: 'parent',
});

export {
  Menu,
  Role,
  User,
  RoleMenuPermission,
  EmpresaPetrolera,
  Forma,
};