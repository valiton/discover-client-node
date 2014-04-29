Discover: Docker Service Discovery Client for Node.JS
========

[![Build Status](https://travis-ci.org/totem/discover-client-node.png?branch=develop)](https://travis-ci.org/totem/discover-client-node)

This is a NodeJS client library for quick lookup of services published by [Discover](http://github.com/totem/discover).

## Installation

```bash
npm install --save discover-client
```

## Quick Start

```js
var Discover = require('discover-client'),
    discover = new Discover({ host: 'etcd.domain.com', port: 4001, prefix: 'discover' });

var service = discover.resolve('my-service-name');

service.on('resolved', function() {
  service.uri(); // returns URI for a random instance who provides the given service
  service.list(); // returns all URI's for instances providing the given service
});

service.on('changed', function() {
  // handle change
});

service.on('notfound', function() {
  // Error handling
});
```
