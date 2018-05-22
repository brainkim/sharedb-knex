require("babel-register");
require("babel-polyfill");
const config = require("./config").default;
module.exports = {
  development: {
    client: "pg",
    connection: config.postgresql.url,
  },
};
