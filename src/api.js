var Promise = require('bluebird');
var rp = require('request-promise');
var extend = require('lodash/extend');

var API_URL = 'https://screener.io/api/v2';
var RETRY_MS = 30 * 1000;
var POLL_MS = 2500;

var checkStatus = function(body, response) {
  if (typeof body === 'string' && body.indexOf('{"error":') === 0) {
    try {
      body = JSON.parse(body);
    } catch (ex) { /**/ }
  }
  if (typeof body === 'object' && body.error && body.error.message) {
    throw new Error(body.error.message);
  } else if (response.statusCode !== 200) {
    throw new Error('Response Code ' + response.statusCode);
  } else {
    return body;
  }
};

var request = function(apiKey, options) {
  var defaults = {
    method: 'GET',
    transform: checkStatus,
    headers: {
      'x-api-key': apiKey
    }
  };
  return rp(extend(defaults, options));
};

exports.getTunnelToken = function(apiKey) {
  var url = API_URL + '/tunnel/token';
  var options = {
    method: 'GET',
    uri: url,
    json: true
  };
  return request(apiKey, options);
};

var createBuild = exports.createBuild = function(apiKey, payload) {
  var url = API_URL + '/projects';
  var options = {
    method: 'POST',
    uri: url,
    json: true,
    body: payload
  };
  return request(apiKey, options);
};

var getBuildStatus = exports.getBuildStatus = function(apiKey, projectId, branch, buildId) {
  var url = API_URL + '/projects/' + encodeURIComponent(projectId) + '/branches/' + encodeURIComponent(branch) + '/builds/' + buildId + '/status';
  var options = {
    uri: url
  };
  return request(apiKey, options);
};

var createBuildWithRetry = exports.createBuildWithRetry = function(apiKey, payload) {
  return createBuild(apiKey, payload)
    .catch(function(err) {
      if (err.message.indexOf('Conflict') >= 0) {
        return Promise.delay(RETRY_MS)
          .then(function() {
            console.log('Existing Build still running. Retrying...');
            return createBuildWithRetry(apiKey, payload);
          });
      } else {
        throw err;
      }
    });
};

var waitForBuild = exports.waitForBuild = function(apiKey, projectId, branch, buildId) {
  return getBuildStatus(apiKey, projectId, branch, buildId)
    .then(function(response) {
      if (response.trim().length > 0) {
        return response;
      }
      return Promise.delay(POLL_MS)
        .then(function() {
          return waitForBuild(apiKey, projectId, branch, buildId);
        });
    })
    .catch(function(err) {
      if (err.message.indexOf('Build Not Found') >= 0) {
        return Promise.delay(POLL_MS)
          .then(function() {
            return waitForBuild(apiKey, projectId, branch, buildId);
          });
      } else {
        throw err;
      }
    });
};
