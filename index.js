'use strict'

var async = require('async')
var MongoClient = require('mongodb').MongoClient

function clean (db, options, done) {
  var exclude = []
  if (arguments.length === 2) { // if only two arguments were supplied
    if (typeof options === 'function') {
      done = options
      options = null
    }
  } else {
    if ('exclude' in options) {
      exclude = options.exclude
    }
  }
  async.waterfall([
    clientify.bind(null, db),
    function (db, cb) {
      db.collections(function (err, collections) {
        if (err) {
          return cb(err)
        }

        // do not drop system collections
        collections = collections.filter(function (coll) {
          return (coll.collectionName.indexOf('system') !== 0 && exclude.indexOf(coll.collectionName) === -1)
        })

        cb(null, db, collections)
      })
    },
    function (db, collections, cb) {
      async.each(collections, function (coll, sinCb) {
        coll.drop(sinCb)
      }, function (err) {
        cb(err, db)
      })
    }
  ], done)
}

function clientify (db, cb) {
  if (typeof db === 'string') {
    MongoClient.connect(db, { w: 1 }, cb)
  } else {
    cb(null, db)
  }
}

module.exports = clean
