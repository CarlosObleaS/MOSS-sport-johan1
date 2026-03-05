const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Usuario', {
    nombre: { type: DataTypes.STRING, unique: true, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    rol: { 
      type: DataTypes.ENUM('organizador', 'arbitro', 'participante'),
      defaultValue: 'organizador' 
    }
  });
};
