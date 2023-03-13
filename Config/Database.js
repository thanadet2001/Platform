const { Sequelize } = require('sequelize');
const config = require('./Config');
  class Database {
  constructor() {
    this.sequelize = new Sequelize(
      config.production.database,
      config.production.username,
      config.production.password,
      {
        host: config.production.host,
        dialect: config.production.dialect,
      }
    );
    this.testConnection();
  }

  testConnection() {
    this.sequelize
      .authenticate()
      .then(() => {
        console.log('Connection has been established successfully.');
      })
      .catch((err) => {
        console.error('Unable to connect to the database:', err);
      });
  }

  RunQuery(sql,queryType, callback) {
    this.sequelize
      .query(sql, { type: queryType ,raw: true})
      .then((result) => {
        if (queryType === 'INSERT') {
          const idQuery = `SELECT LAST_INSERT_ID() AS insertId`;
          this.sequelize.query(idQuery, { type: Sequelize.QueryTypes.SELECT })
            .then((idResult) => {
              callback(idResult);
            })
            .catch((err) => {
              console.error(err);
            });
        } else {
          console.log(result);
          callback(result);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }
}

module.exports = new Database();
