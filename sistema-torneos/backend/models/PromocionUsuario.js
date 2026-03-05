const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('PromocionUsuario', {
    numero: { type: DataTypes.STRING, allowNull: false },
    alias: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    anio: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    indexes: [
      {
        unique: true,
        fields: ['numero', 'anio'],
      },
    ],
  });
};
