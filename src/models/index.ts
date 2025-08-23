// models/index.ts
import User from './User';
import Role from './Role';
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

// Asociaciones existentes
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });

Role.belongsToMany(Menu, { through: RoleMenuPermission, foreignKey: 'role_id', as: 'menus' });
Menu.belongsToMany(Role, { through: RoleMenuPermission, foreignKey: 'menu_id', as: 'roles' });

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