const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Utiliser DATABASE_URL pour Render, sinon config locale SQLite
let sequelize;

if (process.env.DATABASE_URL) {
  // Production (Render)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // Développement local avec SQLite
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../horizon_cafe.db'),
    logging: false
  });
}

module.exports = sequelize;
