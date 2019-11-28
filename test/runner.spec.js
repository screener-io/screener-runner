var expect = require('chai').expect;
var rewire = require('rewire');
var sinon = require('sinon');
var Promise = require('bluebird');
var clone = require('lodash/clone');
var Runner = rewire('../src/runner');
var Tunnel = require('../src/tunnel');
var pkg = require('../package.json');

var config = {
  apiKey: 'api-key',
  projectRepo: 'repo',
  resolutions: [
    '1024x768',
    {deviceName: 'iPhone 6'}
  ],
  build: 'build-id',
  states: [
    {
      url: 'http://localhost:8080/path',
      name: 'State 1',
      steps: [
        {
          type: 'url',
          url: 'http://localhost:8080/path'
        },
        {
          type: 'saveScreenshot',
          name: 'State 1.1'
        },
        {
          type: 'url',
          url: 'http://domain.com/path'
        },
        {
          type: 'saveScreenshot',
          name: 'State 1.2'
        }
      ]
    },
    {
      url: 'http://domain.com/path',
      name: 'State 2'
    }
  ]
};
var sauceCreds = {
  username: 'user',
  accessKey: 'key'
};
var tunnelIdentifier = 'visual-runner-tunnelIdentifier';
var tunnelMock = {
  connect: function(config) {
    if (config.ngrok && config.sauce) {
      expect(config).to.deep.equal({ ngrok: { host: 'localhost:8081', token: 'token' }, sauce: sauceCreds });
      return Promise.resolve('tunnel-url');
    }
    if (config.ngrok) {
      expect(config).to.deep.equal({ ngrok: { host: 'localhost:8081', token: 'token' }});
      return Promise.resolve('tunnel-url');
    }
    if (config.sauce) {
      expect(config.sauce).to.have.deep.property('username', sauceCreds.username);
      expect(config.sauce).to.have.deep.property('accessKey', sauceCreds.accessKey);
      if (config.sauce.launchSauceConnect) {
        expect(config.sauce.tunnelIdentifier).to.equal(tunnelIdentifier);
      }
      return Promise.resolve();
    }
  },
  disconnect: sinon.stub().resolves(),
  transformUrl: Tunnel.transformUrl
};
var apiMock = {
  getTunnelToken: function(apiKey) {
    expect(apiKey).to.equal('api-key');
    return Promise.resolve({
      token: 'token'
    });
  },
  getApiUrl: function() {
    return 'mock://v2';
  },
  createBuildWithRetry: function(apiKey, payload) {
    expect(apiKey).to.equal('api-key');
    expect(payload).to.deep.equal({
      projectRepo: 'repo',
      resolutions: [
        '1024x768',
        {deviceName: 'iPhone 6'}
      ],
      build: 'build-id',
      branch: 'git-branch',
      states: config.states,
      meta: {
        'screener-runner': pkg.version
      }
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
    Runner.__set__('shortid', {
      generate: () => {
        return 'tunnelIdentifier';
      }
    });
  });

  describe('Runner.run', function() {
    it('should run test and wait for successful test status to return', function(done) {
      Runner.run(config)
        .then(function(response) {
          expect(tunnelMock.disconnect.callCount).to.equal(0);
          expect(response).to.equal('status');
          done();
        });
    });

    it('should convert beforeEachScript to string', function(done) {
      Runner.__set__('api', {
        getTunnelToken: apiMock.getTunnelToken,
        getApiUrl: apiMock.getApiUrl,
        createBuildWithRetry: function(apiKey, payload) {
          expect(typeof payload.beforeEachScript).to.equal('string');
          expect(payload.beforeEachScript).to.contain('{ console.log(\'hello\'); }');
          return Promise.resolve({
            project: 'project-id',
            build: 'build-id'
          });
        },
        waitForBuild: apiMock.waitForBuild
      });
      var tmpConfig = JSON.parse(JSON.stringify(config));
      tmpConfig.beforeEachScript = function() { console.log('hello'); };
      Runner.run(tmpConfig)
        .then(function(response) {
          expect(response).to.equal('status');
          done();
        });
    });

    it('should handle multi-browser test run', function(done) {
      Runner.__set__('api', {
        getTunnelToken: apiMock.getTunnelToken,
        getApiUrl: apiMock.getApiUrl,
        createBuildWithRetry: function(apiKey, payload) {
          expect(payload).to.deep.equal({
            projectRepo: 'repo',
            browsers: [
              { browserName: 'firefox' },
              { browserName: 'safari', version: '11.0' }
            ],
            resolutions: [
              '1024x768',
              { deviceName: 'iPhone 6' }
            ],
            build: 'build-id',
            branch: 'git-branch',
            pullRequest: '1',
            states: config.states,
            sauce: sauceCreds,
            meta: {
              'screener-runner': pkg.version
            }
          });
          return Promise.resolve({
            project: 'project-id',
            build: 'build-id'
          });
        },
        waitForBuild: apiMock.waitForBuild
      });
      var tmpConfig = JSON.parse(JSON.stringify(config));
      tmpConfig.browsers = [
        { browserName: 'firefox' },
        { browserName: 'safari', version: '11.0' }
      ];
      tmpConfig.sauce = sauceCreds;
      tmpConfig.pullRequest = '1';
      Runner.run(tmpConfig)
        .then(function(response) {
          expect(tunnelMock.disconnect.callCount).to.equal(0);
          expect(response).to.equal('status');
          done();
        });
    });

    it('should run sauce browsers using sauce connect tunnel', function(done) {
      Runner.__set__('api', {
        getTunnelToken: apiMock.getTunnelToken,
        getApiUrl: apiMock.getApiUrl,
        createBuildWithRetry: function(apiKey, payload) {
          expect(payload).to.deep.equal({
            projectRepo: 'repo',
            browsers: [
              { browserName: 'chrome', version: '78.0' },
              { browserName: 'safari', version: '11.0' }
            ],
            resolutions: [
              '1024x768',
              { deviceName: 'iPhone 6' }
            ],
            build: 'build-id',
            branch: 'git-branch',
            pullRequest: '1',
            states: config.states,
            sauce: {
              username: 'user',
              accessKey: 'key',
              tunnelIdentifier,
            },
            meta: {
              'screener-runner': pkg.version
            }
          });
          return Promise.resolve({
            project: 'project-id',
            build: 'build-id'
          });
        },
        waitForBuild: apiMock.waitForBuild
      });
      var tmpConfig = JSON.parse(JSON.stringify(config));
      tmpConfig.browsers = [
        { browserName: 'chrome', version: '78.0' },
        { browserName: 'safari', version: '11.0' }
      ];
      tmpConfig.sauce = { username: sauceCreds.username, accessKey: sauceCreds.accessKey, launchSauceConnect: true };
      tmpConfig.pullRequest = '1';
      Runner.run(tmpConfig)
        .then(function(response) {
          expect(tunnelMock.disconnect.callCount).to.equal(1);
          expect(response).to.equal('status');
          done();
        });
    });

    it('should convert browser includeRules/excludeRules regex to objects', function(done) {
      Runner.__set__('api', {
        getTunnelToken: apiMock.getTunnelToken,
        getApiUrl: apiMock.getApiUrl,
        createBuildWithRetry: function(apiKey, payload) {
          expect(payload).to.deep.equal({
            projectRepo: 'repo',
            browsers: [
              { browserName: 'firefox', includeRules: [{source: '^Button', flags: ''}, 'Component'] },
              { browserName: 'safari', version: '11.0', excludeRules: [{source: '^Button', flags: ''}, 'Component'] }
            ],
            resolutions: [
              '1024x768',
              { deviceName: 'iPhone 6' }
            ],
            build: 'build-id',
            branch: 'git-branch',
            pullRequest: '1',
            states: config.states,
            sauce: sauceCreds,
            meta: {
              'screener-runner': pkg.version
            }
          });
          return Promise.resolve({
            project: 'project-id',
            build: 'build-id'
          });
        },
        waitForBuild: apiMock.waitForBuild
      });
      var tmpConfig = JSON.parse(JSON.stringify(config));
      tmpConfig.browsers = [
        { browserName: 'firefox', includeRules: [/^Button/, 'Component'] },
        { browserName: 'safari', version: '11.0', excludeRules: [/^Button/, 'Component'] }
      ];
      tmpConfig.sauce = sauceCreds;
      tmpConfig.pullRequest = '1';
      Runner.run(tmpConfig)
        .then(function(response) {
          expect(tunnelMock.disconnect.callCount).to.equal(1);
          expect(response).to.equal('status');
          done();
        });
    });

    it('should convert resolution includeRules/excludeRules regex to objects', function(done) {
      Runner.__set__('api', {
        getTunnelToken: apiMock.getTunnelToken,
        getApiUrl: apiMock.getApiUrl,
        createBuildWithRetry: function(apiKey, payload) {
          expect(payload).to.deep.equal({
            projectRepo: 'repo',
            resolutions: [
              { width: 1024, height: 768, includeRules: [{source: '^Button', flags: ''}, 'Component']},
              { deviceName: 'iPhone 6', excludeRules: [{source: '^Button', flags: ''}, 'Component'] }
            ],
            build: 'build-id',
            branch: 'git-branch',
            states: config.states,
            meta: {
              'screener-runner': pkg.version
            }
          });
          return Promise.resolve({
            project: 'project-id',
            build: 'build-id'
          });
        },
        waitForBuild: apiMock.waitForBuild
      });
      var tmpConfig = JSON.parse(JSON.stringify(config));
      tmpConfig.resolutions = [
        { width: 1024, height: 768, includeRules: [/^Button/, 'Component'] },
        { deviceName: 'iPhone 6', excludeRules: [/^Button/, 'Component'] }
      ];
      Runner.run(tmpConfig)
        .then(function(response) {
          expect(tunnelMock.disconnect.callCount).to.equal(1);
          expect(response).to.equal('status');
          done();
        });
    });

    it('should cancel test run when there are no states', function(done) {
      var tmpConfig = JSON.parse(JSON.stringify(config));
      tmpConfig.states = [];
      Runner.run(tmpConfig)
        .catch(function(err) {
          expect(err.message).to.equal('No states to test');
          done();
        });
    });

    it('should connect, convert to tunnel urls, and disconnect tunnel when tunnel.host exists', function(done) {
      Runner.__set__('api', {
        getTunnelToken: apiMock.getTunnelToken,
        getApiUrl: apiMock.getApiUrl,
        createBuildWithRetry: function(apiKey, payload) {
          expect(payload).to.deep.equal({
            projectRepo: 'repo',
            resolutions: [
              '1024x768',
              {deviceName: 'iPhone 6'}
            ],
            build: 'build-id',
            branch: 'git-branch',
            states: [
              {
                url: 'https://tunnel-url/path',
                name: 'State 1',
                steps: [
                  {
                    type: 'url',
                    url: 'https://tunnel-url/path'
                  },
                  {
                    type: 'saveScreenshot',
                    name: 'State 1.1'
                  },
                  {
                    type: 'url',
                    url: 'http://domain.com/path'
                  },
                  {
                    type: 'saveScreenshot',
                    name: 'State 1.2'
                  }
                ]
              },
              {
                url: 'http://domain.com/path',
                name: 'State 2'
              }
            ],
            meta: {
              'screener-runner': pkg.version
            }
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
      Runner.run(tmpData)
        .then(function(response) {
          expect(tunnelMock.disconnect.callCount).to.equal(2);
          expect(response).to.equal('status');
          done();
        });
    });

    it('should run test and wait for failure test status to return', function(done) {
      Runner.__set__('api', {
        getTunnelToken: apiMock.getTunnelToken,
        createBuildWithRetry: apiMock.createBuildWithRetry,
        getApiUrl: apiMock.getApiUrl,
        waitForBuild: function() {
          return Promise.resolve('Build failed.');
        }
      });
      Runner.run(config)
        .catch(function(err) {
          expect(err.message).to.equal('Build failed.');
          done();
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
