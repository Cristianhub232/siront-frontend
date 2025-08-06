import { DataTypes } from "sequelize";
import { xmlsSequelize } from "@/lib/db";

const Forma = xmlsSequelize.define(
  "Forma",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "id"
    },
    nombre_forma: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "nombre_forma"
    },
    codigo_forma: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "codigo_forma"
    }
  },
  {
    schema: "public",
    tableName: "formas",
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
);

export default Forma; 