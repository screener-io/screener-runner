var expect = require('chai').expect;
var nock = require('nock');
var rewire = require('rewire');
var api = rewire('../src/api');

var API_URL = 'https://screener.io/api/v2';
var headers = {
  reqheaders: {
    'x-api-key': 'api-key'
  }
};
var payload = {
  build: 'build-id',
  states: []
};
var successResponse = {
  project: 'project-id',
  build: 'build-id'
};
var errorResponse = {
  error: {
    message: 'error msg'
  }
};
var conflictResponse = {
  error: {
    message: 'Conflict'
  }
};
var notFoundResponse = {
  error: {
    message: 'Build Not Found'
  }
};

describe('screener-runner/src/api', function() {
  beforeEach(function() {
    api.__set__('RETRY_MS', 10);
    api.__set__('POLL_MS', 10);
  });

  afterEach(function() {
    nock.cleanAll();
  });

  describe('api.getTunnelToken', function() {
    it('should return response on successful request', function() {
      nock(API_URL, headers)
        .get('/tunnel/token')
        .reply(200, {token: 'token'});
      return api.getTunnelToken('api-key')
        .then(function(response) {
          expect(response).to.deep.equal({token: 'token'});
        });
    });

    it('should return error message from failed request', function() {
      nock(API_URL, headers)
        .get('/tunnel/token')
        .reply(400, errorResponse);
      return api.getTunnelToken('api-key')
        .catch(function(err) {
          expect(err.message).to.equal('Error: error msg');
        });
    });
  });

  describe('api.createBuild', function() {
    it('should return response on successful request', function() {
      nock(API_URL, headers)
        .post('/projects', payload)
        .reply(200, successResponse);
      return api.createBuild('api-key', payload)
        .then(function(response) {
          expect(response).to.deep.equal(successResponse);
        });
    });

    it('should return error message from failed request', function() {
      nock(API_URL, headers)
        .post('/projects', payload)
        .reply(400, errorResponse);
      return api.createBuild('api-key', payload)
        .catch(function(err) {
          expect(err.message).to.equal('Error: error msg');
        });
    });

    it('should return error on non-200 failed request', function() {
      nock(API_URL, headers)
        .post('/projects', payload)
        .reply(400, {});
      return api.createBuild('api-key', payload)
        .catch(function(err) {
          expect(err.message).to.equal('Error: Response Code 400');
        });
    });
  });

  describe('api.getBuildStatus', function() {
    it('should return status on successful request', function() {
      nock(API_URL, headers)
        .get('/projects/project-id/branches/branch/builds/build-id/status')
        .reply(200, 'status');
      return api.getBuildStatus('api-key', 'project-id', 'branch', 'build-id')
        .then(function(response) {
          expect(response).to.deep.equal('status');
        });
    });

    it('should return error on non-200 failed request', function() {
      nock(API_URL, headers)
        .get('/projects/project-id/branches/branch/builds/build-id/status')
        .reply(400, '');
      return api.getBuildStatus('api-key', 'project-id', 'branch', 'build-id')
        .catch(function(err) {
          expect(err.message).to.equal('Error: Response Code 400');
        });
    });
  });

  describe('api.createBuildWithRetry', function() {
    it('should return response on successful request', function() {
      nock(API_URL, headers)
        .post('/projects', payload)
        .reply(200, successResponse);
      return api.createBuildWithRetry('api-key', payload)
        .then(function(response) {
          expect(response).to.deep.equal(successResponse);
        });
    });

    it('should retry on conflict until there is no conflict', function() {
      nock(API_URL, headers)
        .post('/projects', payload)
        .reply(409, conflictResponse);
      nock(API_URL, headers)
        .post('/projects', payload)
        .reply(409, conflictResponse);
      nock(API_URL, headers)
        .post('/projects', payload)
        .reply(200, successResponse);
      return api.createBuildWithRetry('api-key', payload)
        .then(function(response) {
          expect(response).to.deep.equal(successResponse);
        });
    });

    it('should return error on failed request', function() {
      nock(API_URL, headers)
        .post('/projects', payload)
        .reply(400, errorResponse);
      return api.createBuildWithRetry('api-key', payload)
        .catch(function(err) {
          expect(err.message).to.equal('Error: error msg');
        });
    });
  });

  describe('api.waitForBuild', function() {
    it('should return status on successful request', function() {
      nock(API_URL, headers)
        .get('/projects/project-id/branches/branch/builds/build-id/status')
        .reply(200, 'status');
      return api.waitForBuild('api-key', 'project-id', 'branch', 'build-id')
        .then(function(response) {
          expect(response).to.deep.equal('status');
        });
    });

    it('should retry until status is returned', function() {
      nock(API_URL, headers)
        .get('/projects/project-id/branches/branch/builds/build-id/status')
        .reply(200, '');
      nock(API_URL, headers)
        .get('/projects/project-id/branches/branch/builds/build-id/status')
        .reply(200, '');
      nock(API_URL, headers)
        .get('/projects/project-id/branches/branch/builds/build-id/status')
        .reply(200, 'status');
      return api.waitForBuild('api-key', 'project-id', 'branch', 'build-id')
        .then(function(response) {
          expect(response).to.deep.equal('status');
        });
    });

    it('should retry when build not found', function() {
      nock(API_URL, headers)
        .get('/projects/project-id/branches/branch/builds/build-id/status')
        .reply(404, notFoundResponse);
      nock(API_URL, headers)
        .get('/projects/project-id/branches/branch/builds/build-id/status')
        .reply(200, 'status');
      return api.waitForBuild('api-key', 'project-id', 'branch', 'build-id')
        .then(function(response) {
          expect(response).to.deep.equal('status');
        });
    });

    it('should return error on non-200 failed request', function() {
      nock(API_URL, headers)
        .get('/projects/project-id/branches/branch/builds/build-id/status')
        .reply(400, '');
      return api.waitForBuild('api-key', 'project-id', 'branch', 'build-id')
        .catch(function(err) {
          expect(err.message).to.equal('Error: Response Code 400');
        });
    });

    it('should use new API endpoint', function() {
      let NEW_API = 'https://new.screener.io/api/v2';
      process.env.SCREENER_API_ENDPOINT = NEW_API;
      api = rewire('../src/api');
      expect(api.getApiUrl()).to.equal(NEW_API);
    });
  });
});
