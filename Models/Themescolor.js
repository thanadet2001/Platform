const database = require('../Config/Database');
const Sequelize = require('sequelize');

module.exports = database.sequelize.define('themescolor', {
    ThemesColorId : {
        primaryKey:true,
        type: Sequelize.INTEGER(11),
        allowNull: false,
    },
    ThemeColor: {
        type: Sequelize.STRING(105),
        allowNull: false,
    },
    Status:{
        type: Sequelize.TINYINT(2),
        allowNull: false,
    }
}, {
    tableName: 'themescolor', // Specify the actual table name here
    freezeTableName: true,
});
