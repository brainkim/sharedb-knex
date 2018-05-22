import { DB as ShareDB } from "sharedb";

export default class ShareDBKnex extends ShareDB {
  constructor(options) {
    super(options);
    this.knex = options.knex;
    this.closed = false;
  }

  close(cb) {
    // NOTE: do we need to destroy knex connection?
    this.closed = true;
    if (cb) {
      cb();
    }
  }

  async commit(collection, id, operation, snapshot, options, cb) {
    try {
      let [{ max }] = await this.knex("sharedb_op")
        .max("version")
        .where({ collection, doc_id: id });
      if (max == null) {
        max = 0;
      }
      if (snapshot.v !== max + 1) {
        return cb(null, false);
      }
      await this.knex.transaction(async (trx) => {
        try {
          await this.knex("sharedb_op")
            .transacting(trx)
            .forUpdate()
            .where({ collection, doc_id: id, version: max });
          await this.knex("sharedb_op")
            .transacting(trx)
            .insert({
              collection,
              doc_id: id,
              version: operation.v,
              operation: JSON.stringify(operation),
            });
          const snapshotBuilder = this.knex("sharedb_snapshot").transacting(
            trx,
          );
          if (max === 0) {
            await snapshotBuilder.insert({
              collection,
              doc_id: id,
              doc_type: snapshot.type,
              version: snapshot.v,
              data: JSON.stringify(snapshot.data),
            });
          } else {
            await snapshotBuilder
              .where({
                collection,
                doc_id: id,
              })
              .update({
                doc_type: snapshot.type,
                version: snapshot.v,
                data: JSON.stringify(snapshot.data),
              });
          }
        } catch (err) {
          cb(err);
          throw err;
        }
      });
      cb(null, true);
    } catch (err) {
      cb(err);
      throw err;
    }
  }

  async getSnapshot(collection, id, fields, options, cb) {
    try {
      let snapshot = { id, v: 0 };
      const [row] = await this.knex("sharedb_snapshot").where({
        collection,
        doc_id: id,
      });
      if (row) {
        snapshot = {
          id,
          v: row.version,
          type: row.doc_type,
          data: row.data,
        };
      }
      cb(null, snapshot);
      return snapshot;
    } catch (err) {
      cb(err);
      throw err;
    }
  }

  async getOps(collection, id, from, to, options, cb) {
    try {
      const rows = await this.knex("sharedb_op")
        .where({ collection, doc_id: id })
        .where("version", ">=", from)
        .where("version", "<", to)
        .orderBy("version", "asc");
      const ops = rows.map((r) => r.operation);
      cb(null, ops);
      return ops;
    } catch (err) {
      cb(err);
      throw err;
    }
  }
}
