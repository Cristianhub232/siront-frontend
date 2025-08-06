import { DataTypes } from "sequelize";
import { petrolerasSequelize } from "@/lib/db";

const EmpresaPetrolera = petrolerasSequelize.define(
  "EmpresaPetrolera",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "id"
    },
    numero: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "numero"
    },
    nombre_empresa: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "nombre_empresa"
    },
    rif: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "rif"
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "fecha_creacion"
    },
    fecha_actualizacion: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "fecha_actualizacion"
    }
  },
  {
    schema: "datalake",
    tableName: "empresas_petroleras",
    timestamps: false,
  }
);

export default EmpresaPetrolera; 