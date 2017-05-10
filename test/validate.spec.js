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
      return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], tunnel: {host: 'host'}, build: 'build', branch: 'branch', resolution: '1280x1024', cssAnimations: true, ignore: 'ignore', includeRules: [], excludeRules: [], initialBaselineBranch: 'master', diffOptions: {}})
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

    it('should throw error when field is unknown', function() {
      return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], someKey: 'key'})
        .catch(function(err) {
          expect(err.message).to.equal('"someKey" is not allowed');
        });
    });

    describe('validate.browsers', function() {
      it('should error when browsers is empty', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], browsers: []})
          .catch(function(err) {
            expect(err.message).to.equal('child "browsers" fails because ["browsers" must contain at least 1 items]');
          });
      });

      it('should error when browsers is set without sauce', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], browsers: [{ browserName: 'chrome' }]})
          .catch(function(err) {
            expect(err.message).to.equal('"browsers" missing required peer "sauce"');
          });
      });

      it('should allow browsers with sauce config', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], browsers: [{ browserName: 'firefox', version: '53.0' }], sauce: { username: 'user', accessKey: 'key' }})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });
    });

    describe('validate.resolutions', function() {
      it('should allow resolutions array by itself', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], resolutions: ['1024x768']})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should allow both string and object resolution formats in resolutions array', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], resolutions: ['1024x768', {deviceName: 'iPhone 6'}]})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should not allow both resolution and resolutions', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], resolution: '1024x768', resolutions: ['1024x768']})
          .catch(function(err) {
            expect(err.message).to.equal('"resolutions" conflict with forbidden peer "resolution"');
          });
      });

      it('should throw error when resolutions is empty', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], resolutions: []})
          .catch(function(err) {
            expect(err.message).to.equal('child "resolutions" fails because ["resolutions" must contain at least 1 items]');
          });
      });

      it('should throw error when resolutions in incorrect format', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], resolutions: 'resolutions'})
          .catch(function(err) {
            expect(err.message).to.equal('child "resolutions" fails because ["resolutions" must be an array]');
          });
      });
    });

    describe('validate.resolutionSchema', function() {
      it('should throw error when resolution in incorrect format', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], resolution: 'resolution'})
          .catch(function(err) {
            expect(err.message).to.equal('child "resolution" fails because ["resolution" with value "resolution" fails to match the resolution pattern, "resolution" must be an object, "resolution" must be an object]');
          });
      });

      it('should allow resolution in string format <width>x<height>', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], resolution: '1024x768'})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should allow resolution in device object format', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], resolution: {deviceName: 'iPhone 6'}})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should allow resolution in device object format with orientation', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], resolution: {deviceName: 'iPhone 6', deviceOrientation: 'landscape'}})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should allow resolution in object format', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], resolution: {width: 1024, height: 768}})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should allow resolution in object format with user agent string', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], resolution: {width: 1024, height: 768, userAgent: 'user agent string'}})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should throw error when resolution object in incorrect format', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], resolution: {deviceName: 'iPhone 6', width: 1024, height: 768}})
          .catch(function(err) {
            expect(err.message).to.equal('child "resolution" fails because ["resolution" must be a string, "deviceName" is not allowed, "width" is not allowed, "height" is not allowed]');
          });
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
