import { DataTypes } from "sequelize";
import { xmlsSequelize } from "@/lib/db";

const Banco = xmlsSequelize.define(
  "Banco",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "id"
    },
    codigo_banco: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "codigo_banco"
    },
    nombre_banco: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "nombre_banco"
    }
  },
  {
    schema: "public",
    tableName: "bancos",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt"
  }
);

export default Banco; 