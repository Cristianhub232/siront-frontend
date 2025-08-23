import { DataTypes } from "sequelize";
import { xmlsSequelize } from "@/lib/db";

const Concepto2024 = xmlsSequelize.define(
  "Concepto2024",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "id"
    },
    cod_presupuestario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "cod_presupuestario"
    },
    id_planilla: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "id_planilla"
    },
    monto_concepto: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      field: "monto_concepto"
    }
  },
  {
    schema: "datalake",
    tableName: "conceptos_2024",
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
);

export default Concepto2024; 