'use strict';

var events = require('events'),
    util = require('util'),
    validPayload = require('./etcd-valid-payload-1.json'),
    setPayload = require('./etcd-set-payload.json'),
    deletePayload = require('./etcd-delete-payload.json');


module.exports.validMock = function (host, port) {
  var watcherInstance = new Watcher();

  var client = {
    get: function (key, opt, cb) {
      process.nextTick(function() {
        cb(null, validPayload);
      });
    },
    watcher: function (key, opt) {
      return watcherInstance;
    },
    watcherInstance: watcherInstance
  };

  return client;
};

module.exports.errorMock = function (host, port) {
  var watcherInstance = new Watcher();

  var client = {
    get: function (key, opt, cb) {
      process.nextTick(function() {
        cb(new Error('error'));
      });
    },
    watcher: function (key, opt) {
      return watcherInstance;
    },
    watcherInstance: watcherInstance
  };

  return client;
};


function Watcher () {
  events.EventEmitter.call(this);
}

util.inherits(Watcher, events.EventEmitter);

Watcher.prototype.trigger = function () {
  var self = this;
  process.nextTick(function() {
    self.emit('set', setPayload);
    self.emit('delete', deletePayload);
  });
}
