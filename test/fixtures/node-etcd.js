'use strict';

var events = require('events'),
    util = require('util'),
    validPayload1 = require('./etcd-valid-payload-1.json'),
    validPayload2 = require('./etcd-valid-payload-2.json');


module.exports.validMock = function (host, port) {
  var watcherInstance = new Watcher();

  var client = {
    get: function (key, opt, cb) {
      cb(null, validPayload1);
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
      cb(new Error('error'));
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
  this.emit('change', validPayload2);
}
