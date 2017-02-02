var api = require('./api');
var Validate = require('./validate');
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

var getTotalStates = exports.getTotalStates = function(states) {
  var total = 0;
  states.forEach(function(state) {
    total++;
    (state.steps || []).forEach(function(step) {
      if (step.type.indexOf('Screenshot') > 0) total++;
    });
  });
  return total;
};

var displayResolution = function(resolution) {
  var result = resolution;
  if (typeof resolution === 'object') {
    result = resolution.deviceName || (resolution.width + 'x' + resolution.height);
  }
  return result;
};

exports.run = function(config) {
  // create copy of config
  config = cloneDeep(config);
  return Validate.runnerConfig(config)
    .then(function() {
      // apply filtering rules
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
      var totalStates = getTotalStates(config.states);
      if (tunnelHost) {
        config.states = transformToTunnelHost(config.states, config.tunnel.host, tunnelHost);
      }
      var payload = pick(config, ['projectRepo', 'build', 'branch', 'states', 'ignore', 'diffOptions']);
      console.log('\n' + totalStates + ' UI state' + (totalStates === 1 ? '' : 's') + ' to capture per resolution');
      if (config.resolution || config.resolutions) {
        payload.resolutions = config.resolutions || [config.resolution];
        console.log('Resolutions:');
        payload.resolutions.forEach(function(resolution, index) {
          console.log('  ' + (index + 1) + '. ' + displayResolution(resolution));
        });
      }
      console.log('\nCreating build for ' + config.projectRepo);
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
