import { DataTypes } from "sequelize";
import { authSequelize } from "@/lib/db";

const Session = authSequelize.define(
  "Session",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "app.users",
        key: "id",
      },
    },
    token_hash: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
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
    tableName: "sessions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

export default Session; 