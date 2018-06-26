require("@babel/register");
const config = require("./config");
module.exports = {
  development: {
    client: "pg",
    connection: config.postgresql.url,
  },
};
