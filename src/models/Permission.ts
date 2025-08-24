import { DataTypes } from "sequelize";
import { authSequelize } from "@/lib/db";

const Permission = authSequelize.define(
  "Permission",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resource: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    schema: "app",
    tableName: "permissions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

export default Permission; 