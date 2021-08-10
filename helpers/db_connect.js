var knex = require("knex");

var connection = knex({
  client: "mysql",
  connection: {
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE,
  },
  acquireConnectionTimeout: 5000,
});

connection
  .raw("select 1+1 as result")
  .then((r) => console.log("Mysql connected successfully"))
  .catch((e) => console.error(e));

module.exports = connection;
