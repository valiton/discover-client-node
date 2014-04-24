'use strict';

var chai = require('chai'),
    expect = chai.expect,
    fixtures = require('./fixtures');

var URI_SET_1 = [
  'tcp://10.198.67.175:49155',
  'tcp://10.202.158.62:49155',
  'tcp://10.202.159.221:49156'
]

var URI_SET_2 = [
  'tcp://10.198.67.175:49155',
  'tcp://10.202.159.221:49256'
]

describe('Discover Client - Service', function () {

  var ServiceFactory = require('../lib/service');

  describe('ServiceFactory()', function () {
    it('should create a new ServiceFactory instance using valid configuration', function (done) {
      var etcd = fixtures.etcd.validMock('host.com', '1234'),
          serviceFactory;

      try {
        serviceFactory = ServiceFactory('discover', etcd);
      } catch (err) {
        expect(err).to.not.exist;
      }

      expect(serviceFactory).to.exist;
      done();
    });

    it('should create a new ServiceFactory instance using invalid configuration', function (done) {
      var serviceFactory;

      try {
        serviceFactory = ServiceFactory();
      } catch (err) {
        expect(err).to.exist;
      }

      expect(serviceFactory).to.not.exist;
      done();
    });
  });

  describe('ServiceFactory#newService()', function () {
    it('should create a new Service given a valid service name', function (done) {
      var etcd = fixtures.etcd.validMock('host.com', '1234'),
          serviceFactory;

      try {
        serviceFactory = ServiceFactory('discover', etcd);
      } catch (err) {
        expect(err).to.not.exist;
      }

      var service = serviceFactory.newService('proxy-api');

      expect(service).to.exist;
      done();
    });

    it('should create a new Service given a valid service name and emit resolved event', function (done) {
      var etcd = fixtures.etcd.validMock('host.com', '1234'),
          serviceFactory;

      serviceFactory = ServiceFactory('discover', etcd);

      var service = serviceFactory.newService('proxy-api');

      expect(service.on).to.be.a('function');

      service.on('resolved', function() { done(); });
    });

    it('should throw attempting to create a new Service without a service name', function (done) {
      var etcd = fixtures.etcd.validMock('host.com', '1234'),
          serviceFactory,
          service;

      try {
        serviceFactory = ServiceFactory('discover', etcd);
      } catch (err) {
        expect(err).to.not.exist;
      }

      try {
        service = serviceFactory.newService();
      } catch (err) {
        expect(err).to.exist;
      }

      expect(service).to.not.exist;
      done();
    });

    it('should create a new Service even when etcd has an error resolving the service for a given service name', function (done) {
      var etcd = fixtures.etcd.errorMock('host.com', '1234'),
          serviceFactory,
          service;

      try {
        serviceFactory = ServiceFactory('discover', etcd);
      } catch (err) {
        expect(err).to.not.exist;
      }

      try {
        service = serviceFactory.newService('proxy-api');
      } catch (err) {
        expect(err).to.not.exist;
      }

      expect(service).to.exist;
      done();
    });

  });

  describe('Service#url()', function () {
    it('should get a random URI for a valid service name', function (done) {
      var etcd = fixtures.etcd.validMock('host.com', '1234'),
          serviceFactory, service;

      try {
        serviceFactory = ServiceFactory('discover', etcd);
        service = serviceFactory.newService('proxy-api');
      } catch (err) {
        expect(err).to.not.exist;
      }

      service.on('resolved', function() {
        var uri = service.uri();

        expect(URI_SET_1).to.include.members([uri]);
        done();
      });
    });
  });

  describe('Service#list()', function () {
    it('should get a full list of URIs for a valid service name', function (done) {
      var etcd = fixtures.etcd.validMock('host.com', '1234'),
          serviceFactory, service;

      try {
        serviceFactory = ServiceFactory('discover', etcd);
        service = serviceFactory.newService('proxy-api');
      } catch (err) {
        expect(err).to.not.exist;
      }

      service.on('resolved', function() {
        var list = service.list();

        expect(URI_SET_1).to.deep.equal(list);
        done();
      });
    });

    it('should find no service instances when etcd has an error resolving the service for a given service name', function (done) {
      var etcd = fixtures.etcd.errorMock('host.com', '1234'),
          serviceFactory,
          service;

      try {
        serviceFactory = ServiceFactory('discover', etcd);
      } catch (err) {
        expect(err).to.not.exist;
      }

      try {
        service = serviceFactory.newService('proxy-api');
      } catch (err) {
        expect(err).to.not.exist;
      }

      service.on('notfound', function() {
        var list = service.list();

        expect([]).to.deep.equal(list);
        done();
      });
    });
  });

  describe('Service#_watch()', function () {
    it('should update the service list when a watched service is updated in etcd', function (done) {
      var etcd = fixtures.etcd.validMock('host.com', '1234'),
          serviceFactory, service;

      try {
        serviceFactory = ServiceFactory('discover', etcd);
        service = serviceFactory.newService('proxy-api');
      } catch (err) {
        expect(err).to.not.exist;
      }

      // Trigger a change event
      etcd.watcherInstance.trigger();

      // Wait a tick so the event can propigate
      process.nextTick(function () {
        var list = service.list();
        expect(URI_SET_2).to.deep.equal(list);
        done();
      });
    });
  });


});
