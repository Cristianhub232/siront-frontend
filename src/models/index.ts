// models/index.ts
import User from './User';
import Role from './Role';
import Permission from './Permission';
import RolePermission from './RolePermission';
import Session from './Session';
import AuditLog from './AuditLog';
import Menu from './Menu';
import RoleMenuPermission from './RoleMenuPermission';
import Banco from './Banco';
import Forma from './Forma';
import EmpresaPetrolera from './EmpresaPetrolera';
import CodigoPresupuestario from './CodigoPresupuestario';
import Concepto2024 from './Concepto2024';
import PlanillaRecaudacion2024 from './PlanillaRecaudacion2024';
import FormaNoValidada from './FormaNoValidada';
import PlanillaSinConcepto from './PlanillaSinConcepto';

export {
  User,
  Role,
  Permission,
  RolePermission,
  Session,
  AuditLog,
  Menu,
  RoleMenuPermission,
  Banco,
  Forma,
  EmpresaPetrolera,
  CodigoPresupuestario,
  Concepto2024,
  PlanillaRecaudacion2024,
  FormaNoValidada,
  PlanillaSinConcepto
};

// Asociaciones de autenticación
User.belongsTo(Role, { 
  foreignKey: 'role_id', 
  as: 'role',
  targetKey: 'id'
});
Role.hasMany(User, { 
  foreignKey: 'role_id', 
  as: 'users',
  sourceKey: 'id'
});

// Asociaciones de permisos
Role.belongsToMany(Permission, { 
  through: RolePermission, 
  foreignKey: 'role_id', 
  otherKey: 'permission_id',
  as: 'permissions' 
});
Permission.belongsToMany(Role, { 
  through: RolePermission, 
  foreignKey: 'permission_id', 
  otherKey: 'role_id',
  as: 'roles' 
});

// Asociaciones de sesiones
User.hasMany(Session, { 
  foreignKey: 'user_id', 
  as: 'sessions',
  sourceKey: 'id'
});
Session.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user',
  targetKey: 'id'
});

// Asociaciones de auditoría
User.hasMany(AuditLog, { 
  foreignKey: 'user_id', 
  as: 'auditLogs',
  sourceKey: 'id'
});
AuditLog.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user',
  targetKey: 'id'
});

// Asociaciones existentes del sistema
Role.belongsToMany(Menu, { 
  through: RoleMenuPermission, 
  foreignKey: 'role_id', 
  otherKey: 'menu_id',
  as: 'menus' 
});
Menu.belongsToMany(Role, { 
  through: RoleMenuPermission, 
  foreignKey: 'menu_id', 
  otherKey: 'role_id',
  as: 'roles' 
});

// Asociaciones para Reportes de Cierre
PlanillaRecaudacion2024.hasMany(Concepto2024, {
  foreignKey: 'id_planilla',
  as: 'Conceptos2024',
});
Concepto2024.belongsTo(PlanillaRecaudacion2024, {
  foreignKey: 'id_planilla',
  as: 'PlanillaRecaudacion2024',
});

CodigoPresupuestario.hasMany(Concepto2024, {
  foreignKey: 'cod_presupuestario',
  as: 'Conceptos2024',
});
Concepto2024.belongsTo(CodigoPresupuestario, {
  foreignKey: 'cod_presupuestario',
  as: 'CodigoPresupuestario',
});