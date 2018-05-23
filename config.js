require("dotenv").config();
module.exports = {
  postgresql: {
    url: process.env.POSTGRES_URL,
  },
};
