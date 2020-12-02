var Promise = require('bluebird');
var requestretry = require('requestretry');
var extend = require('lodash/extend');

var API_URL = process.env.SCREENER_API_ENDPOINT || 'https://screener.io/api/v2';

var RETRY_MS = 30 * 1000;
var POLL_MS = 2500;

var getApiUrl = exports.getApiUrl = function () {
  return API_URL;
};

var request = function(authOptions, options) {


  var headers = {};

  if(authOptions.username && authOptions.accessKey){
    const buffer = Buffer.from(`${authOptions.username}:${authOptions.accessKey}`);
    headers['Authorization'] = `Basic ${buffer.toString('base64')}`;
  }

  if(authOptions.apiKey){
    headers['x-api-key'] = authOptions.apiKey;
  }

  var defaults = {
    method: 'GET',
    headers: headers,
    maxAttempts: 10
  };
  return new Promise(function(resolve, reject) {
    requestretry(extend(defaults, options), function(err, response, body) {
      if (err) {
        return reject(err);
      }
      if (typeof body === 'string' && body.indexOf('{"error":') === 0) {
        try {
          body = JSON.parse(body);
        } catch (ex) { /**/ }
      }
      if (typeof body === 'object' && body.error && body.error.message) {
        reject(new Error('Error: ' + body.error.message));
      } else if (response.statusCode !== 200) {
        reject(new Error('Error: Response Code ' + response.statusCode));
      } else {
        resolve(body);
      }
    });
  });
};

exports.getTunnelToken = function(authOptions) {
  var url = `${getApiUrl()}/tunnel/token`;
  var options = {
    method: 'GET',
    uri: url,
    json: true
  };
  return request(authOptions, options);
};

var createBuild = exports.createBuild = function(authOptions, payload) {
  var url = `${getApiUrl()}/projects`;
  var options = {
    method: 'POST',
    uri: url,
    json: true,
    body: payload
  };
  return request(authOptions, options);
};

var getBuildStatus = exports.getBuildStatus = function(authOptions, projectId, branch, buildId) {
  var url = getApiUrl() + '/projects/' + encodeURIComponent(projectId) + '/branches/' + encodeURIComponent(branch) + '/builds/' + encodeURIComponent(buildId) + '/status';
  var options = {
    uri: url
  };
  return request(authOptions, options);
};

var createBuildWithRetry = exports.createBuildWithRetry = function(authOptions, payload) {
  return createBuild(authOptions, payload)
    .catch(function(err) {
      if (err.message.indexOf('Conflict') >= 0) {
        return Promise.delay(RETRY_MS)
          .then(function() {
            console.log('Existing Build still running. Retrying...');
            return createBuildWithRetry(authOptions, payload);
          });
      } else {
        throw err;
      }
    });
};

var waitForBuild = exports.waitForBuild = function(authOptions, projectId, branch, buildId) {
  return getBuildStatus(authOptions, projectId, branch, buildId)
    .then(function(response) {
      if (response.trim().length > 0) {
        return response;
      }
      return Promise.delay(POLL_MS)
        .then(function() {
          return waitForBuild(authOptions, projectId, branch, buildId);
        });
    })
    .catch(function(err) {
      if (err.message.indexOf('Build Not Found') >= 0) {
        return Promise.delay(POLL_MS)
          .then(function() {
            return waitForBuild(authOptions, projectId, branch, buildId);
          });
      } else {
        throw err;
      }
    });
};
