var expect = require('chai').expect;
var validate = require('../src/validate');

describe('screener-runner/src/validate', function() {
  describe('validate.runnerConfig', function() {
    it('should throw error when no value passed in', function() {
      return validate.runnerConfig()
        .catch(function(err) {
          expect(err.message).to.equal('"value" is required');
        });
    });

    it('should throw error when no apiKey', function() {
      return validate.runnerConfig({})
        .catch(function(err) {
          expect(err.message).to.equal('child "apiKey" fails because ["apiKey" is required]');
        });
    });

    it('should throw error when no projectRepo', function() {
      return validate.runnerConfig({apiKey: 'key'})
        .catch(function(err) {
          expect(err.message).to.equal('child "projectRepo" fails because ["projectRepo" is required]');
        });
    });

    it('should throw error when no states', function() {
      return validate.runnerConfig({apiKey: 'key', projectRepo: 'repo'})
        .catch(function(err) {
          expect(err.message).to.equal('child "states" fails because ["states" is required]');
        });
    });

    it('should allow states with no values', function() {
      return validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: []})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should throw error when states item is incorrect shape', function() {
      return validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{}]})
        .catch(function(err) {
          expect(err.message).to.equal('child "states" fails because ["states" at position 0 fails because [child "url" fails because ["url" is required]]]');
        });
    });

    it('should throw error when tunnel exists but host is not set', function() {
      return validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], tunnel: {}})
        .catch(function(err) {
          expect(err.message).to.equal('child "tunnel" fails because [child "host" fails because ["host" is required]]');
        });
    });

    it('should allow adding optional fields', function() {
      return validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], tunnel: {host: 'host'}, build: 'build', branch: 'branch', resolution: '1280x1024', ignore: 'ignore', includeRules: [], excludeRules: [], diffOptions: {}})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should allow include/exclude rules that are strings', function() {
      return validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], includeRules: ['string'], excludeRules: ['string']})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should allow include/exclude rules that are regex expressions', function() {
      return validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], includeRules: [/^string$/], excludeRules: [/^string$/]})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should throw error when include/exclude rules are not in array', function() {
      return validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], includeRules: 'string', excludeRules: 'string'})
        .catch(function(err) {
          expect(err.message).to.equal('child "includeRules" fails because ["includeRules" must be an array]');
        });
    });

    it('should throw error when resolution in incorrect format', function() {
      return validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], resolution: 'resolution'})
        .catch(function(err) {
          expect(err.message).to.equal('child "resolution" fails because ["resolution" with value "resolution" fails to match the resolution pattern]');
        });
    });

    it('should throw error when field is unknown', function() {
      return validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], someKey: 'key'})
        .catch(function(err) {
          expect(err.message).to.equal('"someKey" is not allowed');
        });
    });
  });
});
