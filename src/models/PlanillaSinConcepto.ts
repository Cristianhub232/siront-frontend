import { DataTypes } from 'sequelize';
import { xmlsSequelize } from '@/lib/db';

const PlanillaSinConcepto = xmlsSequelize.define(
  "PlanillaSinConcepto",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: "id" },
    rif_contribuyente: { type: DataTypes.STRING, allowNull: false, field: "rif_contribuyente" },
    num_planilla: { type: DataTypes.STRING, allowNull: false, field: "num_planilla" },
    monto_total_trans: { type: DataTypes.DOUBLE, allowNull: false, field: "monto_total_trans" },
    codigo_forma: { type: DataTypes.INTEGER, allowNull: false, field: "codigo_forma" },
    nombre_forma: { type: DataTypes.STRING, allowNull: false, field: "nombre_forma" },
    planilla_id: { type: DataTypes.INTEGER, allowNull: false, field: "planilla_id" },
    fecha_trans: { type: DataTypes.DATE, allowNull: true, field: "fecha_trans" }
  },
  {
    schema: "datalake",
    tableName: "planillas_sin_conceptos_mv",
    timestamps: false
  }
);

export default PlanillaSinConcepto;