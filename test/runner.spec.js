var expect = require('chai').expect;
var rewire = require('rewire');
var sinon = require('sinon');
var Promise = require('bluebird');
var clone = require('lodash/clone');
var Runner = rewire('../src/runner');
var Tunnel = require('../src/tunnel');

var config = {
  apiKey: 'api-key',
  projectRepo: 'repo',
  build: 'build-id',
  states: [
    {
      url: 'http://localhost:8080/path',
      name: 'State 1'
    },
    {
      url: 'http://domain.com/path',
      name: 'State 2'
    }
  ]
};
var tunnelMock = {
  connect: function(host) {
    expect(host).to.equal('localhost:8081');
    return Promise.resolve('tunnel-url');
  },
  disconnect: sinon.spy(),
  transformUrl: Tunnel.transformUrl
};
var apiMock = {
  createBuildWithRetry: function(apiKey, payload) {
    expect(apiKey).to.equal('api-key');
    expect(payload).to.deep.equal({
      projectRepo: 'repo',
      build: 'build-id',
      branch: 'git-branch',
      states: config.states
    });
    return Promise.resolve({
      project: 'project-id',
      build: 'build-id'
    });
  },
  waitForBuild: function() {
    return Promise.resolve('status');
  }
};
var proxyMock = {
  startServer: function() {
    return Promise.resolve('localhost:8081');
  }
};
var ciMock = {
  setVars: function(src) {
    src.branch = 'git-branch';
    return src;
  }
};

Runner.__set__('GzipProxy', proxyMock);
Runner.__set__('CI', ciMock);

describe('screener-runner/src/runner', function() {
  beforeEach(function() {
    Runner.__set__('Tunnel', tunnelMock);
    Runner.__set__('api', apiMock);
  });

  describe('Runner.run', function() {
    it('should run test and wait for succesful test status to return', function() {
      return Runner.run(config)
        .then(function(response) {
          expect(tunnelMock.disconnect.called).to.equal(false);
          expect(response).to.equal('status');
        });
    });

    it('should cancel test run when there are no states', function() {
      var tmpConfig = JSON.parse(JSON.stringify(config));
      tmpConfig.states = [];
      return Runner.run(tmpConfig)
        .then(function(response) {
          expect(response).to.equal('No states to test');
        });
    });

    it('should connect, convert to tunnel urls, and disconnect tunnel when tunnel.host exists', function() {
      Runner.__set__('api', {
        createBuildWithRetry: function(apiKey, payload) {
          expect(payload).to.deep.equal({
            projectRepo: 'repo',
            build: 'build-id',
            branch: 'git-branch',
            states: [
              {
                url: 'https://tunnel-url/path',
                name: 'State 1'
              },
              {
                url: 'http://domain.com/path',
                name: 'State 2'
              }
            ]
          });
          return Promise.resolve({
            project: 'project-id',
            build: 'build-id'
          });
        },
        waitForBuild: apiMock.waitForBuild
      });
      var tmpData = clone(config);
      // add host to start tunnel
      tmpData.tunnel = {
        host: 'localhost:8080',
        gzip: true
      };
      return Runner.run(tmpData)
        .then(function(response) {
          expect(tunnelMock.disconnect.called).to.equal(true);
          expect(response).to.equal('status');
        });
    });

    it('should run test and wait for failure test status to return', function() {
      Runner.__set__('api', {
        createBuildWithRetry: apiMock.createBuildWithRetry,
        waitForBuild: function() {
          return Promise.resolve('failed');
        }
      });
      return Runner.run(config)
        .catch(function(err) {
          expect(err.message).to.equal('failed');
        });
    });
  });

  describe('Runner.getTotalStates', function() {
    it('should return count of all states', function() {
      var states = [{}, {}, {}];
      expect(Runner.getTotalStates(states)).to.equal(3);
    });

    it('should return count including steps', function() {
      var states = [{
        steps: [
          {type: 'clickElement'},
          {type: 'saveScreenshot'},
          {type: 'setElementText'},
          {type: 'saveScreenshot'}
        ]
      }];
      expect(Runner.getTotalStates(states)).to.equal(3);
    });
  });
});
