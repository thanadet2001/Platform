const database = require('../Config/Database');
const Sequelize = require('sequelize');
module.exports = database.sequelize.define('bgcolor', {
    BgColorId: {
        primaryKey:true,
        type: Sequelize.TINYINT(2),
        allowNull: false,
    },
    BgColorName: {
        type: Sequelize.STRING(105),
        allowNull: false,
        unique: true,
    },
    Status: {
        type: Sequelize.STRING(45),
        allowNull: false,
    },
}, {
    tableName: 'bgcolor', // Specify the actual table name here
    freezeTableName: true,
});