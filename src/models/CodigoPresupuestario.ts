import { DataTypes } from "sequelize";
import { xmlsSequelize } from "@/lib/db";

const CodigoPresupuestario = xmlsSequelize.define(
  "CodigoPresupuestario",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "id"
    },
    codigo_presupuestario: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "codigo_presupuestario"
    },
    designacion_presupuestario: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "designacion_presupuestario"
    }
  },
  {
    schema: "public",
    tableName: "codigos_presupuestarios",
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
);

export default CodigoPresupuestario; 