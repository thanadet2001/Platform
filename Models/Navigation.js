const database = require('../Config/Database');
const Sequelize = require('sequelize');

module.exports = database.sequelize.define('navigation', {
    NavigationId : {
        primaryKey:true,
        type: Sequelize.SMALLINT(2),
        allowNull: false,
    },
    NavigationType: {
        type: Sequelize.STRING(45),
        allowNull: false,
    },
    Status:{
        type: Sequelize.TINYINT(2),
        allowNull: false,
    }
}, {
    tableName: 'navigation', // Specify the actual table name here
    freezeTableName: true,
});
