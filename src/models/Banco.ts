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
    codigo: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "codigo"
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "nombre"
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "descripcion"
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "tipo"
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
    schema: "public",
    tableName: "bancos",
    timestamps: false,
  }
);

export default Banco; 