/*!
 * Discover Client
 * Copyright(c) 2014 meltmedia <mike@meltmedia.com>
 */

'use strict';

var winston = require('winston');


module.exports = ServiceFactory;


/*
 * # ServiceFactory
 * Factory for producing properly configured `Service` objects within the context of this
 * configured instance.
 *
 * + prefix (string, 'discover') ... String representing the prefix where `Discover` is registerd.
 * + etcd (Etcd) ... Configured instance of `node-etcd`
 */
function ServiceFactory(prefix, etcd) {
  if (!(this instanceof ServiceFactory)) {
    return new ServiceFactory(prefix, etcd);
  }

  if (!etcd) { throw new Error('A valid Etcd instance is required.'); }

  this.etcd = etcd;
  this.prefix = prefix || 'discover';
}

ServiceFactory.prototype.newService = function newService(serviceName) {
  if (!serviceName) { throw new Error('A service name is required.'); }

  var path = '/' + this.prefix + '/service/' + serviceName;

  return new Service(path, this.etcd);
};


/*
 * # Service
 * Represents a named service where 0-n number of service providers may match.
 *
 * + servicePath (string) ... Path to service following the path structure of `Discover`
 *     where a path can be anything from `serviceName` or deeper:
 *     /<prefix>/service/<serviceName>/<realm>/<hostId>/<containerId>
 * + etcd (Etcd) ... Configured instance of `node-etcd`
 */
function Service(servicePath, etcd) {
  this.etcd = etcd;
  this.servicePath = servicePath;

  // List of currently resolved service for this path
  this.services = {};

  // Resolve the services for the path for the first time
  this._resolve();

  // Watch for changes to published services so we don't go stale
  this._watch();
}

Service.prototype.uri = function uri() {
  var keys = Object.keys(this.services),
      index = Math.floor(Math.random() * keys.length);
  return this.services[keys[index]];
};

Service.prototype.list = function list() {
  var self = this,
      keys = Object.keys(this.services);
  return keys.map(function (key) { return self.services[key]; });
};

/*
 * Resolve the service path, populating the availabe service for the first time
 */
Service.prototype._resolve = function _resolve() {
  var self = this;

  this.etcd.get(this.servicePath, { recursive: true }, function (err, result) {
    if (err) {
      // this isn't necisarily a failure as their simply might not be a service registerd yet
      winston.log('debug', 'Initial attempt at service lookup failed due to: %s', err);
      return;
    }

    extractServices(result, self.services);
    winston.log('debug', 'Successfuly populated initial service list for key: %s', self.servicePath);
  });
};

/*
 * Watch for changes
 */
Service.prototype._watch = function _watch() {
  var self = this;

  // Watch the path changes
  this.watcher = this.etcd.watcher(this.servicePath, { recursive: true });

  // Every time a change occurs in available services, update the list
  this.watcher.on('change', function (result) {
    var services = {};
    extractServices(result, services);
    self.services = services;
    winston.log('debug', 'A registered service changed, new service list is: %s', services);
  });
};

/*
 * Recurse through a response body from Etcd, searching for leafs that represent service entries
 */
function extractServices(search, services) {
  if (Array.isArray(search)) {
    // We got passed an array of nodes, process each one individualy
    search.forEach(function (item) {
      extractServices(item, services);
    });
  }

  else if (search.dir) {
    // We are a directory, recurse with the nodes
    extractServices(search.nodes, services);
  }

  else if (search.node) {
    // We are at the root of the search, recurse with the node's result
    extractServices(search.node, services);
  }

  else if (search.value) {
    // We are finaly at a leaf, extract the service info
    services[search.key] = search.value;
  }

  return;
}