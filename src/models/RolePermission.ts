import { DataTypes } from "sequelize";
import { authSequelize } from "@/lib/db";

const RolePermission = authSequelize.define(
  "RolePermission",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "app.roles",
        key: "id",
      },
    },
    permission_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "app.permissions",
        key: "id",
      },
    },
  },
  {
    schema: "app",
    tableName: "role_permissions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

export default RolePermission; 