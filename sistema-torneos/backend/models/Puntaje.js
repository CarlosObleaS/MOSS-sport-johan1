const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Puntaje = sequelize.define('Puntaje', {
    promocion: { type: DataTypes.STRING, allowNull: false }, // Ej: "21"
    categoria: { type: DataTypes.STRING, allowNull: false }, // Ej: "SUPER MASTER"
    adicional: { type: DataTypes.INTEGER, defaultValue: 0 },
    inauguracion: { type: DataTypes.INTEGER, defaultValue: 0 },
    atletismo: { type: DataTypes.INTEGER, defaultValue: 0 },
    baloncesto: { type: DataTypes.INTEGER, defaultValue: 0 },
    fulbito: { type: DataTypes.INTEGER, defaultValue: 0 },
    cubilete: { type: DataTypes.INTEGER, defaultValue: 0 },
    billas: { type: DataTypes.INTEGER, defaultValue: 0 },
    penia: { type: DataTypes.INTEGER, defaultValue: 0 },
    natacion: { type: DataTypes.INTEGER, defaultValue: 0 },
    tiro: { type: DataTypes.INTEGER, defaultValue: 0 },
    tenis: { type: DataTypes.INTEGER, defaultValue: 0 },
    ajedrez: { type: DataTypes.INTEGER, defaultValue: 0 },
    cross_country: { type: DataTypes.INTEGER, defaultValue: 0 },
    // Campo virtual: Se calcula solo al pedir los datos, no ocupa espacio en DB
    puntaje_total: {
      type: DataTypes.VIRTUAL,
      get() {
        return (
          this.adicional + this.inauguracion + this.atletismo + this.baloncesto +
          this.fulbito + this.cubilete + this.billas + this.penia +
          this.natacion + this.tiro + this.tenis + this.ajedrez + this.cross_country
        );
      }
    }
  });
  return Puntaje;
};