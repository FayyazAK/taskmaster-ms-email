const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Email = sequelize.define(
  "Email",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    recipientEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
      index: true,
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "sent", "failed"),
      defaultValue: "pending",
      allowNull: true,
      index: true,
    },
    emailType: {
      type: DataTypes.ENUM(
        "registration",
        "verification",
        "password_reset",
        "other"
      ),
      defaultValue: "other",
      allowNull: true,
    },
    scheduledFor: {
      type: DataTypes.DATE,
      allowNull: true,
      index: true,
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

module.exports = Email;
