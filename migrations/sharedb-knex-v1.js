exports.up = function(knex, Promise) {
  return knex.schema
    .createTable("sharedb_op", function(table) {
      table.string("collection").notNullable();
      table.string("doc_id").notNullable();
      table.integer("version").notNullable();
      table.json("operation").notNullable();
      table.primary(["collection", "doc_id", "version"]);
    })
    .createTable("sharedb_snapshot", function(table) {
      table.string("collection").notNullable();
      table.string("doc_id").notNullable();
      table.string("doc_type").notNullable();
      table.integer("version").notNullable();
      table.json("data").notNullable();
      table.primary(["collection", "doc_id"]);
    });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .withSchema("sharedb")
    .dropTable("sharedb_snapshot")
    .dropTable("sharedb_op");
};
