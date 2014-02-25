/*!
 * Discover Client
 * Copyright(c) 2014 meltmedia <mike@meltmedia.com>
 */

'use strict';

var Etcd = require('node-etcd'),
    ServiceFactory = require('./service');


module.exports = Discover;


function Discover(config) {
  if (!(this instanceof Discover)) {
    return new Discover(config);
  }

  this.etcd = new Etcd(config.host, config.port);
  this.servicePrefix = config.prefix || 'discover';

  this.serviceFactory = new ServiceFactory(this.servicePrefix, this.etcd);
  this.cache = {};
}

Discover.prototype.resolve = function resolve(serviceName) {
  if (!serviceName) { throw new Error('A service name is required.'); }

  // Create a new service if not previously cached
  if (!this.cache[serviceName]) {
    this.cache[serviceName] = this.serviceFactory.newService(serviceName);
  }

  return this.cache[serviceName];
};
