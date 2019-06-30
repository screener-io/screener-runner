var api = require('./api');
var Validate = require('./validate');
var Rules = require('./rules');
var Tunnel = require('./tunnel');
var CI = require('./ci');
var GzipProxy = require('./gzip-proxy');
var Promise = require('bluebird');
var cloneDeep = require('lodash/cloneDeep');
var omit = require('lodash/omit');
var pkg = require('../package.json');

var MAX_MS = 30 * 60 * 1000; // max 30 mins

var transformToTunnelHost = function(states, host, tunnelHost) {
  return states.map(function(state) {
    state.url = Tunnel.transformUrl(state.url, host, tunnelHost);
    if (state.steps) {
      state.steps = state.steps.map(function(step) {
        if (step.type === 'url') {
          step.url = Tunnel.transformUrl(step.url, host, tunnelHost);
        }
        return step;
      });
    }
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

var displayBrowser = function(browser) {
  var result = {
    chrome: 'Chrome',
    firefox: 'Firefox',
    safari: 'Safari',
    microsoftedge: 'Microsoft Edge',
    'internet explorer': 'Internet Explorer'
  }[browser.browserName.toLowerCase()];
  if (browser.version) {
    result += ' ' + browser.version;
  }
  return result;
};

var convertRegex = function(array) {
  return array.map(function(item) {
    if (item instanceof RegExp) {
      return {
        source: item.source,
        flags: item.flags
      };
    }
    return item;
  });
};

// convert RegExp into plain objects so that they can be JSON stringified
var convertRules = function(array) {
  return array.map(function(item) {
    if (item.includeRules) {
      item.includeRules = convertRegex(item.includeRules);
    }
    if (item.excludeRules) {
      item.excludeRules = convertRegex(item.excludeRules);
    }
    return item;
  });
};

exports.run = function(config) {
  var timer;
  // create copy of config
  config = cloneDeep(config);
  return Validate.runnerConfig(config)
    .then(function() {
      // add package version
      if (!config.meta) config.meta = {};
      config.meta['screener-runner'] = pkg.version;
      // apply filtering rules
      config.states = Rules.filter(config.states, 'name', config.includeRules, config.excludeRules);
      // cancel if there are 0 states
      if (config.states.length === 0) {
        throw new Error('No states to test');
      }
      config = CI.setVars(config);
      if (config.tunnel) {
        return api.getTunnelToken(config.apiKey)
          .then(function(response) {
            // if no token in response, try again
            if (!response || !response.token) {
              return api.getTunnelToken(config.apiKey);
            }
            return response;
          });
      } else {
        return Promise.resolve();
      }
    })
    .then(function(response) {
      if (config.tunnel) {
        config.tunnel.token = response.token;
      }
      if (config.tunnel && config.tunnel.gzip) {
        var options = {
          targetHost: config.tunnel.host,
          cache: config.tunnel.cache
        };
        return GzipProxy.startServer(options);
      } else {
        return Promise.resolve();
      }
    })
    .then(function(proxyHost) {
      if (config.tunnel) {
        console.log('Connecting tunnel');
        return Tunnel.connect(proxyHost || config.tunnel.host, config.tunnel.token);
      } else {
        return Promise.resolve();
      }
    })
    .then(function(tunnelHost) {
      var totalStates = getTotalStates(config.states);
      if (tunnelHost) {
        config.states = transformToTunnelHost(config.states, config.tunnel.host, tunnelHost);
      }
      var payload = omit(config, ['apiKey', 'resolution', 'resolutions', 'includeRules', 'excludeRules', 'tunnel', 'failureExitCode']);
      if (typeof payload.beforeEachScript === 'function') {
        payload.beforeEachScript = payload.beforeEachScript.toString();
      }
      if (!config.shots) {
        console.log('\n' + totalStates + ' UI state' + (totalStates === 1 ? '' : 's') + ' to capture per ' + (config.browsers ? 'browser/' : '') + 'resolution');
        if (config.browsers) {
          console.log('Browsers:');
          config.browsers.forEach(function(browser, index) {
            console.log('  ' + (index + 1) + '. ' + displayBrowser(browser));
          });
          config.browsers = convertRules(config.browsers);
        }
        if (config.resolution || config.resolutions) {
          payload.resolutions = config.resolutions || [config.resolution];
          console.log('Resolutions:');
          payload.resolutions.forEach(function(resolution, index) {
            console.log('  ' + (index + 1) + '. ' + displayResolution(resolution));
          });
          payload.resolutions = convertRules(payload.resolutions);
        }
      }
      console.log('\nCreating build for ' + config.projectRepo);
      return api.createBuildWithRetry(config.apiKey, payload).timeout(MAX_MS, 'Timeout waiting for Build');
    })
    .then(function(response) {
      config.project = response.project;
      config.build = response.build;
      config.branch = response.branch;
      console.log('Waiting for build #' + config.build + ' on ' + config.branch + ' to complete...\n');
      console.log('View progress via Screener\'s Dashboard => https://screener.io/v2\n');
      // output to ensure CI does not timeout
      timer = setInterval(function() { console.log('.'); }, 120*1000);
      return api.waitForBuild(config.apiKey, config.project, config.branch, config.build).timeout(MAX_MS, 'Timeout waiting for Build');
    })
    .then(function(response) {
      clearInterval(timer);
      if (config.tunnel) {
        console.log('Disconnecting tunnel');
        Tunnel.disconnect();
      }
      if (response.indexOf('Build failed.') >= 0 && (config.failureExitCode !== 0 || response.indexOf('error running') >= 0)) {
        throw new Error(response);
      }
      return response;
    });
};
