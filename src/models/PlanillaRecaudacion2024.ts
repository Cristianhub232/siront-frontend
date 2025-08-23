import { DataTypes } from "sequelize";
import { xmlsSequelize } from "@/lib/db";

const PlanillaRecaudacion2024 = xmlsSequelize.define(
  "PlanillaRecaudacion2024",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "id"
    },
    rif_contribuyente: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "rif_contribuyente"
    },
    archivo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "archivo_id"
    },
    cod_banco: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "cod_banco"
    },
    cod_agencia: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "cod_agencia"
    },
    cod_safe: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "cod_safe"
    },
    cod_seg_planilla: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "cod_seg_planilla"
    },
    fecha_trans: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "fecha_trans"
    },
    fecha_rec: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "fecha_rec"
    },
    cod_forma: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "cod_forma"
    },
    num_planilla: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "num_planilla"
    },
    periodo: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "periodo"
    },
    cod_aduana: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "cod_aduana"
    },
    cod_region: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "cod_region"
    },
    cancelado_elec: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "cancelado_elec"
    },
    monto_total_trans: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      field: "monto_total_trans"
    },
    monto_total_efectivo: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      field: "monto_total_efectivo"
    },
    monto_total_cheque: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      field: "monto_total_cheque"
    },
    monto_total_titulos: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      field: "monto_total_titulos"
    },
    monto_total_cert: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      field: "monto_total_cert"
    },
    monto_total_bonos_ex: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      field: "monto_total_bonos_ex"
    },
    monto_total_dpn: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      field: "monto_total_dpn"
    },
    registro: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: "registro"
    }
  },
  {
    schema: "datalake",
    tableName: "planillas_recaudacion_2024",
    timestamps: true,
    createdAt: 'createdat',
    updatedAt: 'updatedat'
  }
);

export default PlanillaRecaudacion2024; 