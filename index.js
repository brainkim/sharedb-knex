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

  async commit(collection, id, operation, snapshot, __options, cb) {
    try {
      let [{ max }] = await this.knex("sharedb_op")
        .max("version")
        .where({ collection, doc_id: id });
      // NOTE: operations start at 0, snapshots starts at 1.
      // The max operation found in the db will be 1 version behind the
      // operation and 2 versions behind the snapshot passed in above.
      if (max == null) {
        max = -1;
      }
      if (operation.v !== max + 1 || snapshot.v !== max + 2) {
        cb(null, false);
        return false;
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
          if (max === -1) {
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
                updated_at: this.knex.fn.now(),
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

  async getSnapshot(collection, id, __fields, __options, cb) {
    try {
      let snapshot = { id, v: 0, type: null };
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

  async getOps(collection, id, from, to, __options, cb) {
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
