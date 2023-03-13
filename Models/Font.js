const database = require('../Config/Database');
const Sequelize = require('sequelize');

module.exports = database.sequelize.define('font', {
    FontId : {
        primaryKey:true,
        type: Sequelize.INTEGER(11),
        allowNull: false,
    },
    FontName: {
        type: Sequelize.STRING(105),
        allowNull: false,
    },
    Status:{
        type: Sequelize.TINYINT(2),
        allowNull: false,
    }
}, {
    tableName: 'font', // Specify the actual table name here
    freezeTableName: true,
});
