const database = require('../Config/Database');
const Sequelize = require('sequelize');
module.exports = database.sequelize.define('settings', {
    SettingId: {
        primaryKey:true,
        type: Sequelize.INTEGER(11),
        allowNull: false,
    },
    LogoWeb: {
        type: Sequelize.STRING(255),
        allowNull: false,
    },
    WebName: {
        type: Sequelize.STRING(100),
        allowNull: false,
    },
    WebAddress: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    WebTel: {
        type: Sequelize.STRING(10),
        allowNull: false,
    },
    WebEmail: {
        type: Sequelize.STRING(175),
        allowNull: false,
    },
}, {
    tableName: 'settings', // Specify the actual table name here
    freezeTableName: true,
});