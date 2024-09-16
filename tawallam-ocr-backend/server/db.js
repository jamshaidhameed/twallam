const mysql2 = require("mysql2");

//Set mysql2 connection to use poolPromise
const pool = mysql2.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  password: process.env.DB_PASSWORD,
});

module.exports = {
  promisePool: function () {
    return pool.promise();
  },
};
