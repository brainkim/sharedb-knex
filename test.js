/* eslint-env mocha */
import { assert } from "chai";

// TODO: figure out how to test this stuff
import Knex from "knex";
import config from "./config";
import ShareDBKnex from "./index";

describe("ShareDBKnex", function() {
  before(() => {
    this.knex = Knex({
      client: "pg",
      connection: config.postgresql.url,
    });
    this.db = new ShareDBKnex({ knex: this.knex });
  });

  beforeEach(async () => {
    await this.knex("sharedb_op").truncate();
    await this.knex("sharedb_snapshot").truncate();
  });

  after(() => {
    this.knex.destroy();
  });

  it("commits", (done) => {
    this.db.commit(
      "poop",
      "a",
      { v: 0 },
      { v: 1, type: "json0", data: "poop" },
      null,
      (err, success) => {
        assert.isNull(err);
        assert(success);
        done();
      },
    );
  });
});
