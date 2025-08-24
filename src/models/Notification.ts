import { Model, DataTypes, Sequelize } from 'sequelize';
import { xmlsSequelize } from '@/lib/db';

interface NotificationAttributes {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high';
  created_by: string;
  is_active: boolean;
  expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

interface NotificationCreationAttributes extends Omit<NotificationAttributes, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
}

class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  public id!: string;
  public title!: string;
  public message!: string;
  public type!: 'info' | 'warning' | 'error' | 'success';
  public priority!: 'low' | 'medium' | 'high';
  public created_by!: string;
  public is_active!: boolean;
  public expires_at?: Date;
  public created_at!: Date;
  public updated_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('info', 'warning', 'error', 'success'),
      allowNull: false,
      defaultValue: 'info',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
      defaultValue: 'medium',
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    sequelize: xmlsSequelize,
    tableName: 'notifications',
    schema: 'app',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['created_by'],
      },
      {
        fields: ['is_active'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['priority'],
      },
      {
        fields: ['created_at'],
      },
    ],
  }
);

export default Notification; 