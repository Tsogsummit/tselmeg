const { Sequelize } = require('sequelize');
const path = require('path');

// Use SQLite for simplicity as requested/implied by environment
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: false, // Turn off logging for cleaner output
});

module.exports = sequelize;
