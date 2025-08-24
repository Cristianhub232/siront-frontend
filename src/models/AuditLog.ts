import { DataTypes } from "sequelize";
import { authSequelize } from "@/lib/db";

const AuditLog = authSequelize.define(
  "AuditLog",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "app.users",
        key: "id",
      },
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    resource: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    resource_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    details: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.INET,
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    schema: "app",
    tableName: "audit_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

export default AuditLog; 