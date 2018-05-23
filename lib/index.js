module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _sharedb = __webpack_require__(1);

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class ShareDBKnex extends _sharedb.DB {
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

  commit(collection, id, operation, snapshot, __options, cb) {
    var _this = this;

    return _asyncToGenerator(function* () {
      try {
        let [{ max }] = yield _this.knex("sharedb_op").max("version").where({ collection, doc_id: id });
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
        yield _this.knex.transaction((() => {
          var _ref = _asyncToGenerator(function* (trx) {
            try {
              yield _this.knex("sharedb_op").transacting(trx).forUpdate().where({ collection, doc_id: id, version: max });
              yield _this.knex("sharedb_op").transacting(trx).insert({
                collection,
                doc_id: id,
                version: operation.v,
                operation: JSON.stringify(operation)
              });
              const snapshotBuilder = _this.knex("sharedb_snapshot").transacting(trx);
              if (max === -1) {
                yield snapshotBuilder.insert({
                  collection,
                  doc_id: id,
                  doc_type: snapshot.type,
                  version: snapshot.v,
                  data: JSON.stringify(snapshot.data)
                });
              } else {
                yield snapshotBuilder.where({
                  collection,
                  doc_id: id
                }).update({
                  doc_type: snapshot.type,
                  version: snapshot.v,
                  data: JSON.stringify(snapshot.data),
                  updated_at: _this.knex.fn.now()
                });
              }
            } catch (err) {
              cb(err);
              throw err;
            }
          });

          return function (_x) {
            return _ref.apply(this, arguments);
          };
        })());
        cb(null, true);
      } catch (err) {
        cb(err);
        throw err;
      }
    })();
  }

  getSnapshot(collection, id, __fields, __options, cb) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      try {
        let snapshot = { id, v: 0, type: null };
        const [row] = yield _this2.knex("sharedb_snapshot").where({
          collection,
          doc_id: id
        });
        if (row) {
          snapshot = {
            id,
            v: row.version,
            type: row.doc_type,
            data: row.data
          };
        }
        cb(null, snapshot);
        return snapshot;
      } catch (err) {
        cb(err);
        throw err;
      }
    })();
  }

  getOps(collection, id, from, to, __options, cb) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      try {
        const rows = yield _this3.knex("sharedb_op").where({ collection, doc_id: id }).where("version", ">=", from).where("version", "<", to).orderBy("version", "asc");
        const ops = rows.map(function (r) {
          return r.operation;
        });
        cb(null, ops);
        return ops;
      } catch (err) {
        cb(err);
        throw err;
      }
    })();
  }
}
exports.default = ShareDBKnex;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("sharedb");

/***/ })
/******/ ]);