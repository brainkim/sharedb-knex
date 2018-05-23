exports.up = function(knex, Promise) {
  return knex.schema
    .createTable("sharedb_op", function(table) {
      table.string("collection").notNullable();
      table.string("doc_id").notNullable();
      table.integer("version").notNullable();
      table.jsonb("operation").notNullable();
      table.timestamps(false, true);
      table.primary(["collection", "doc_id", "version"]);
    })
    .createTable("sharedb_snapshot", function(table) {
      table.string("collection").notNullable();
      table.string("doc_id").notNullable();
      table.string("doc_type").notNullable();
      table.integer("version").notNullable();
      table.jsonb("data").notNullable();
      table.timestamps(false, true);
      table.primary(["collection", "doc_id"]);
    });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTable("sharedb_snapshot")
    .dropTable("sharedb_op");
};
