// models/User.ts
import { DataTypes } from "sequelize";
import { authSequelize } from "@/lib/db";

const User = authSequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    password_hash: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "app.roles",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "suspended"),
      defaultValue: "active",
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    locked_until: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    schema: "app",
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default User;
