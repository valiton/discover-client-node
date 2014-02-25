'use strict';

var chai = require('chai'),
    rewire = require('rewire'),
    expect = chai.expect,
    fixtures = require('./fixtures');

describe('Discover Client - Discover', function () {

  var DiscoverModule = rewire('../lib/discover');

  describe('Discover()', function () {

    it('should create a new Discover instance using valid configuration', function (done) {
      var discover;

      DiscoverModule.__set__('Etcd', fixtures.etcd.validMock);
      var Discover = DiscoverModule.__get__('Discover');

      try {
        discover = Discover({ host: 'host.com', port: 1234, prefix: 'discover' });
      } catch (err) {
        expect(err).to.not.exist;
      }

      expect(discover).to.exist;
      done();
    });

    it('should create a new Discover instance using invalid configuration', function (done) {
      var discover;

      DiscoverModule.__set__('Etcd', fixtures.etcd.validMock);
      var Discover = DiscoverModule.__get__('Discover');

      try {
        discover = Discover();
      } catch (err) {
        expect(err).to.exist;
      }

      expect(discover).to.not.exist;
      done();
    });
  });

  describe('Discover#resolve()', function () {

    it('should resolve a valid Service containing entries for a given service name', function (done) {
      var discover;

      DiscoverModule.__set__('Etcd', fixtures.etcd.validMock);
      var Discover = DiscoverModule.__get__('Discover');

      try {
        discover = Discover({ host: 'host.com', port: 1234, prefix: 'discover' });
      } catch (err) {
        expect(err).to.not.exist;
      }

      var service = discover.resolve('proxy-api'),
          list = service.list();

      expect(list).to.not.be.empty;
      done();
    });

    it('should throw attempting to resolve a new Service without a service name', function (done) {
      var discover, service;

      DiscoverModule.__set__('Etcd', fixtures.etcd.validMock);
      var Discover = DiscoverModule.__get__('Discover');

      try {
        discover = Discover({ host: 'host.com', port: 1234, prefix: 'discover' });
      } catch (err) {
        expect(err).to.not.exist;
      }

      try {
        service = discover.resolve();
      } catch (err) {
        expect(err).to.exist;        
      }

      expect(service).to.not.exist;
      done();
    });

    it('should cache Service instances for subsequent resolution for the same service name', function (done) {
      var discover;

      DiscoverModule.__set__('Etcd', fixtures.etcd.validMock);
      var Discover = DiscoverModule.__get__('Discover');

      try {
        discover = Discover({ host: 'host.com', port: 1234, prefix: 'discover' });
      } catch (err) {
        expect(err).to.not.exist;
      }

      var service1 = discover.resolve('proxy-api'),
          service2 = discover.resolve('proxy-api');

      expect(service1).to.equal(service2);
      done();
    });

  });
});
