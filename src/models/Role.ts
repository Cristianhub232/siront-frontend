import { DataTypes } from "sequelize";
import { authSequelize } from "@/lib/db";

const Role = authSequelize.define(
  "Role",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },
  },
  {
    schema: "app",
    tableName: "roles",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Role;
