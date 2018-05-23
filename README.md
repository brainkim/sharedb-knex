# sharedb-knex

⚠️⚠️⚠️ experimental and untested ⚠️⚠️⚠️

Knex database adapter for [sharedb](https://github.com/share/sharedb). This
driver can be used both as a snapshot store and oplog.

Doesn’t support queries.

## Usage

1. Create a knex migration and copy over `migrations/sharedb-knex-v1.js`.

2. Instantiate a sharedb-knex instance and pass in a knex instance:

```javascript
import Knex from "knex";
import ShareDBKnex from "sharedb-knex";
const knex = Knex({
  // your knex config
});
const db = new ShareDBKnex({ knex });
const backend = new ShareDB({db});
```
