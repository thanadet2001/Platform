const database = require('../Config/Database');
const Sequelize = require('sequelize');

module.exports = database.sequelize.define('socialmedia', {
    SocialMediaId: {
        primaryKey:true,
        type: Sequelize.SMALLINT(5),
        allowNull: false,
    },
    NameSocialMedia: {
        type: Sequelize.STRING(45),
        allowNull: false,
    },
    SrcSocialMeida:{
        type: Sequelize.STRING(255),
        allowNull: false,
    }
}, {
    tableName: 'socialmedia', // Specify the actual table name here
    freezeTableName: true,
});
