var expect = require('chai').expect;
var Validate = require('../src/validate');

var steps = [
  {
    type: 'saveScreenshot',
    name: 'State Name'
  },
  {
    type: 'clickElement',
    locator: {
      type: 'css selector',
      value: 'selector'
    }
  },
  {
    type: 'moveTo',
    locator: {
      type: 'css selector',
      value: 'selector'
    }
  },
  {
    type: 'setElementText',
    locator: {
      type: 'css selector',
      value: 'selector'
    },
    text: 'text'
  },
  {
    type: 'executeScript',
    code: 'code'
  },
  {
    type: 'executeScript',
    code: 'code',
    isAsync: true
  },
  {
    type: 'ignoreElements',
    locator: {
      type: 'css selector',
      value: 'selector'
    }
  },
  {
    type: 'pause',
    waitTime: 300
  },
  {
    type: 'waitForElementPresent',
    locator: {
      type: 'css selector',
      value: 'msOrSelector'
    }
  }
];

describe('screener-runner/src/validate', function() {
  describe('validate.runnerConfig', function() {
    it('should throw error when no value passed in', function() {
      return Validate.runnerConfig()
        .catch(function(err) {
          expect(err.message).to.equal('"value" is required');
        });
    });

    it('should throw error when no apiKey', function() {
      return Validate.runnerConfig({})
        .catch(function(err) {
          expect(err.message).to.equal('child "apiKey" fails because ["apiKey" is required]');
        });
    });

    it('should throw error when no projectRepo', function() {
      return Validate.runnerConfig({apiKey: 'key'})
        .catch(function(err) {
          expect(err.message).to.equal('child "projectRepo" fails because ["projectRepo" is required]');
        });
    });

    it('should throw error when no states', function() {
      return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo'})
        .catch(function(err) {
          expect(err.message).to.equal('child "states" fails because ["states" is required]');
        });
    });

    it('should allow states with no values', function() {
      return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: []})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should throw error when states item is incorrect shape', function() {
      return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{}]})
        .catch(function(err) {
          expect(err.message).to.equal('child "states" fails because ["states" at position 0 fails because [child "url" fails because ["url" is required]]]');
        });
    });

    it('should allow states with steps', function() {
      return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name', steps: steps}, {url: 'http://url.com', name: 'name'}]})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should throw error when tunnel exists but host is not set', function() {
      return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], tunnel: {}})
        .catch(function(err) {
          expect(err.message).to.equal('child "tunnel" fails because [child "host" fails because ["host" is required]]');
        });
    });

    it('should allow adding optional fields', function() {
      return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], tunnel: {host: 'host'}, build: 'build', branch: 'branch', resolution: '1280x1024', ignore: 'ignore', includeRules: [], excludeRules: [], diffOptions: {}})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should allow include/exclude rules that are strings', function() {
      return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], includeRules: ['string'], excludeRules: ['string']})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should allow include/exclude rules that are regex expressions', function() {
      return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], includeRules: [/^string$/], excludeRules: [/^string$/]})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should throw error when include/exclude rules are not in array', function() {
      return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], includeRules: 'string', excludeRules: 'string'})
        .catch(function(err) {
          expect(err.message).to.equal('child "includeRules" fails because ["includeRules" must be an array]');
        });
    });

    it('should throw error when resolution in incorrect format', function() {
      return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], resolution: 'resolution'})
        .catch(function(err) {
          expect(err.message).to.equal('child "resolution" fails because ["resolution" with value "resolution" fails to match the resolution pattern]');
        });
    });

    it('should throw error when field is unknown', function() {
      return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], someKey: 'key'})
        .catch(function(err) {
          expect(err.message).to.equal('"someKey" is not allowed');
        });
    });
  });

  describe('validate.steps', function() {
    it('should error when value not array', function() {
      var result = Validate.steps('test');
      expect(result.error.message).to.equal('"value" must be an array');
    });

    it('should error when step with invalid type added', function() {
      var steps = [
        {
          type: 'type',
          name: 'hello'
        }
      ];
      var result = Validate.steps(steps);
      expect(result.error.message).to.equal('"value" at position 0 does not match any of the allowed types');
    });

    it('should error when valid step with extra property is added', function() {
      var testSteps = [
        {
          type: 'saveScreenshot',
          name: 'hello',
          extra: 'prop'
        }
      ];
      var result = Validate.steps(testSteps);
      expect(result.error.message).to.equal('"value" at position 0 does not match any of the allowed types');
    });

    it('should allow all valid types', function() {
      var result = Validate.steps(steps);
      expect(result.error).to.equal(null);
    });
  });
});
