const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.MYSQLDATABASE || process.env.DB_NAME,
    process.env.MYSQLUSER     || process.env.DB_USER || 'root',
    process.env.MYSQLPASSWORD || process.env.DB_PASS || '',
    {
        host:    process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
        port:    process.env.MYSQLPORT || 3306,
        dialect: 'mysql',
    }
);

module.exports = sequelize;