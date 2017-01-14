var api = require('./api');
var validate = require('./validate');
var Rules = require('./rules');
var Tunnel = require('./tunnel');
var CI = require('./ci');
var GzipProxy = require('./gzip-proxy');
var Promise = require('bluebird');
var cloneDeep = require('lodash/cloneDeep');
var pick = require('lodash/pick');

var MAX_MS = 30 * 60 * 1000; // max 30 mins

var transformToTunnelHost = function(states, host, tunnelHost) {
  return states.map(function(state) {
    state.url = Tunnel.transformUrl(state.url, host, tunnelHost);
    return state;
  });
};

exports.run = function(config) {
  // create copy of config
  config = cloneDeep(config);
  return validate.runnerConfig(config)
    .then(function() {
      // apply includeRules and excludeRules
      config.states = Rules.filter(config.states, 'name', config.includeRules, config.excludeRules);
      // cancel if there are 0 states
      if (config.states.length === 0) {
        throw new Error('no-states');
      }
      config = CI.setVars(config);
      return Promise.resolve();
    })
    .then(function() {
      if (config.tunnel && config.tunnel.gzip) {
        return GzipProxy.startServer(config.tunnel.host);
      } else {
        return Promise.resolve();
      }
    })
    .then(function(proxyHost) {
      if (config.tunnel) {
        console.log('Connecting tunnel');
        return Tunnel.connect(proxyHost || config.tunnel.host);
      } else {
        return Promise.resolve();
      }
    })
    .then(function(tunnelHost) {
      console.log(config.states.length + ' UI state' + (config.states.length === 1 ? '' : 's') + ' to capture and test');
      console.log('Creating build for ' + config.projectRepo);
      if (tunnelHost) {
        config.states = transformToTunnelHost(config.states, config.tunnel.host, tunnelHost);
      }
      var payload = pick(config, ['projectRepo', 'build', 'branch', 'resolution', 'states', 'ignore', 'diffOptions']);
      return api.createBuildWithRetry(config.apiKey, payload).timeout(MAX_MS, 'Timeout waiting for Build');
    })
    .then(function(response) {
      config.project = response.project;
      config.build = response.build;
      config.branch = response.branch;
      console.log('Waiting for build #' + config.build + ' on ' + config.branch + ' to complete...');
      return api.waitForBuild(config.apiKey, config.project, config.branch, config.build).timeout(MAX_MS, 'Timeout waiting for Build');
    })
    .then(function(response) {
      if (config.tunnel) {
        console.log('Disconnecting tunnel');
        Tunnel.disconnect();
      }
      if (response.indexOf('fail') >= 0) {
        throw new Error(response);
      }
      return response;
    })
    .catch(function(err) {
      if (err.message === 'no-states') {
        return Promise.resolve('No states to test');
      }
      throw err;
    });
};
