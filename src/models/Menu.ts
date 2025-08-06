import { DataTypes } from "sequelize";
import sequelize from "@/lib/db";

const Menu = sequelize.define(
  "Menu",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    route: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "parent_id", // 👈 campo físico en la tabla
    },
    section: {
      type: DataTypes.ENUM("main", "secondary", "document"),
      allowNull: false,
      defaultValue: "main",
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    metabaseID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "metabase_dashboard_id", // 👈 campo físico en la tabla
    }
  },
  {
    schema: "public",
    tableName: "menus",
    timestamps: false,
  }
);

export default Menu;
