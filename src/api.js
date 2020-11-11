var Promise = require('bluebird');
var requestretry = require('requestretry');
var extend = require('lodash/extend');

var API_URL = process.env.SCREENER_API_ENDPOINT || 'https://screener.io/api/v2';

var RETRY_MS = 30 * 1000;
var POLL_MS = 2500;

var getApiUrl = exports.getApiUrl = function () {
  return API_URL;
};

var request = function(authObject, options) {

  var headers = {};

  if(authObject.username && authObject.accessKey){
    const buffer = Buffer.from(`${options.username}:${options.accessKey}`);
    headers['Authorization'] = `Basic ${buffer.toString('base64')}`;
  }

  if(authObject.apiKey){
    headers['x-api-key'] = apiKey;
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

exports.getTunnelToken = function(authObject) {
  var url = `${getApiUrl()}/tunnel/token`;
  var options = {
    method: 'GET',
    uri: url,
    json: true
  };
  return request(authObject, options);
};

var createBuild = exports.createBuild = function(authObject, payload) {
  var url = `${getApiUrl()}/projects`;
  var options = {
    method: 'POST',
    uri: url,
    json: true,
    body: payload
  };
  return request(authObject, options);
};

var getBuildStatus = exports.getBuildStatus = function(authObject, projectId, branch, buildId) {
  var url = getApiUrl() + '/projects/' + encodeURIComponent(projectId) + '/branches/' + encodeURIComponent(branch) + '/builds/' + encodeURIComponent(buildId) + '/status';
  var options = {
    uri: url
  };
  return request(authObject, options);
};

var createBuildWithRetry = exports.createBuildWithRetry = function(authObject, payload) {
  return createBuild(authObject, payload)
    .catch(function(err) {
      if (err.message.indexOf('Conflict') >= 0) {
        return Promise.delay(RETRY_MS)
          .then(function() {
            console.log('Existing Build still running. Retrying...');
            return createBuildWithRetry(authObject, payload);
          });
      } else {
        throw err;
      }
    });
};

var waitForBuild = exports.waitForBuild = function(authObject, projectId, branch, buildId) {
  return getBuildStatus(authObject, projectId, branch, buildId)
    .then(function(response) {
      if (response.trim().length > 0) {
        return response;
      }
      return Promise.delay(POLL_MS)
        .then(function() {
          return waitForBuild(authObject, projectId, branch, buildId);
        });
    })
    .catch(function(err) {
      if (err.message.indexOf('Build Not Found') >= 0) {
        return Promise.delay(POLL_MS)
          .then(function() {
            return waitForBuild(authObject, projectId, branch, buildId);
          });
      } else {
        throw err;
      }
    });
};
