const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Publicacion', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Payload completo: categorias, promociones (con logos), usuariosAdmin, publicadoEn, calendario
    payload: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    anio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: new Date().getFullYear(),
      // unique: true, // Comentado para evitar error de migración con datos existentes
    },
  });
};
