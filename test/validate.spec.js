var expect = require('chai').expect;
var Validate = require('../src/validate');

var steps = [
  {
    type: 'url',
    url: 'http://url.com'
  },
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
    type: 'clickElement',
    locator: {
      type: 'css selector',
      value: 'selector'
    },
    maxTime: 30000
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
    type: 'clearElementText',
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
    text: 'password',
    isPassword: true
  },
  {
    type: 'setElementText',
    locator: {
      type: 'css selector',
      value: 'selector'
    },
    text: '' // should allow empty string
  },
  {
    type: 'sendKeys',
    locator: {
      type: 'css selector',
      value: 'selector'
    },
    keys: '' // should allow empty string
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
    type: 'clearIgnores'
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
  },
  {
    type: 'waitForElementPresent',
    locator: {
      type: 'css selector',
      value: 'msOrSelector'
    },
    maxTime: 120000
  },
  {
    type: 'waitForElementNotPresent',
    locator: {
      type: 'css selector',
      value: 'selector'
    }
  },
  {
    type: 'cssAnimations',
    isEnabled: true
  }
];

describe('screener-runner/src/validate', function() {
  describe('validate.runnerConfig', function() {
    it('should throw error when no value passed in', function(done) {
      Validate.runnerConfig()
        .catch(function(err) {
          expect(err.message).to.equal('"value" is required');
          done();
        });
    });

    it('should throw error when no apiKey', function(done) {
      Validate.runnerConfig({})
        .catch(function(err) {
          expect(err.message).to.equal('child "apiKey" fails because ["apiKey" is required]');
          done();
        });
    });

    it('should throw error when no projectRepo', function(done) {
      Validate.runnerConfig({apiKey: 'key'})
        .catch(function(err) {
          expect(err.message).to.equal('child "projectRepo" fails because ["projectRepo" is required]');
          done();
        });
    });

    it('should throw error when tunnel exists but host is not set', function(done) {
      Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], tunnel: {}})
        .catch(function(err) {
          expect(err.message).to.equal('child "tunnel" fails because [child "host" fails because ["host" is required]]');
          done();
        });
    });

    it('should allow adding optional fields', function() {
      return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], tunnel: {host: 'host'}, build: 'build', branch: 'branch', commit: 'commit', resolution: '1280x1024', cssAnimations: true, ignore: 'ignore', meta: {'screener-storybook': '0.9.15'}, hide: 'hide', includeRules: [], excludeRules: [], initialBaselineBranch: 'master', disableDiffOnError: true, baseBranch: 'master', diffOptions: {compareSVGDOM: true, minShiftGraphic: 5}, failOnNewStates: true, disableAutoSnapshots: true, disableConcurrency: true, newSessionForEachState: true, beforeEachScript: function() {}, ieNativeEvents: true})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should allow disableBranchBaseline option when baseBranch is set', function() {
      return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], disableBranchBaseline: true, baseBranch: 'master'})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should not allow disableBranchBaseline option when baseBranch is not set', function(done) {
      Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], disableBranchBaseline: true})
        .catch(function(err) {
          expect(err.message).to.equal('"disableBranchBaseline" missing required peer "baseBranch"');
          done();
        });
    });

    it('should allow useNewerBaseBranch option when baseBranch is set', function() {
      return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], useNewerBaseBranch: 'latest', baseBranch: 'master'})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should not allow useNewerBaseBranch option when baseBranch is not set', function(done) {
      Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], useNewerBaseBranch: 'latest'})
        .catch(function(err) {
          expect(err.message).to.equal('"useNewerBaseBranch" missing required peer "baseBranch"');
          done();
        });
    });

    it('should allow alwaysAcceptBaseBranch option when baseBranch is set', function() {
      return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], alwaysAcceptBaseBranch: true, baseBranch: 'master'})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should not allow alwaysAcceptBaseBranch option when baseBranch is not set', function(done) {
      Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], alwaysAcceptBaseBranch: true})
        .catch(function(err) {
          expect(err.message).to.equal('"alwaysAcceptBaseBranch" missing required peer "baseBranch"');
          done();
        });
    });

    it('should allow optional vsts config', function() {
      return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], vsts: {instance: 'myproject.visualstudio.com'}})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should throw error when vsts does not have instance', function(done) {
      Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], vsts: {}})
        .catch(function(err) {
          expect(err.message).to.equal('child "vsts" fails because [child "instance" fails because ["instance" is required]]');
          done();
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

    it('should throw error when include/exclude rules are not in array', function(done) {
      Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], includeRules: 'string', excludeRules: 'string'})
        .catch(function(err) {
          expect(err.message).to.equal('child "includeRules" fails because ["includeRules" must be an array]');
          done();
        });
    });

    it('should throw error when field is unknown', function(done) {
      Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], someKey: 'key'})
        .catch(function(err) {
          expect(err.message).to.equal('"someKey" is not allowed');
          done();
        });
    });

    describe('validate.failureExitCode', function() {
      it('should allow setting to 0', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], failureExitCode: 0})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should error when setting above 255', function(done) {
        Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], failureExitCode: 256})
          .catch(function(err) {
            expect(err.message).to.equal('child "failureExitCode" fails because ["failureExitCode" must be less than or equal to 255]');
            done();
          });
      });
    });

    describe('validate.states', function() {
      it('should throw error when no states', function(done) {
        Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo'})
          .catch(function(err) {
            expect(err.message).to.equal('child "states" fails because ["states" is required]');
            done();
          });
      });

      it('should allow states with no values', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: []})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should throw error when states item is incorrect shape', function(done) {
        Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{}]})
          .catch(function(err) {
            expect(err.message).to.equal('child "states" fails because ["states" at position 0 fails because [child "url" fails because ["url" is required]]]');
            done();
          });
      });

      it('should allow states with correct shape object', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}]})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should error when state name is > 200 chars', function(done) {
        Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'this is a crazy super long title. this is a crazy super long title. this is a crazy super long title. this is a crazy super long title. this is a crazy super long title. this is a crazy super long title. this is a crazy super long title. this is a crazy super long title.'}]})
          .catch(function(err) {
            expect(err.message).to.equal('child "states" fails because ["states" at position 0 fails because [child "name" fails because ["name" length must be less than or equal to 200 characters long]]]');
            done();
          });
      });

      it('should allow states with steps', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name', steps: steps}, {url: 'http://url.com', name: 'name'}]})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should allow states with shotsIndex', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name', shotsIndex: 0}]})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should error when shotsIndex < 0', function(done) {
        Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name', shotsIndex: -1}]})
          .catch(function(err) {
            expect(err.message).to.equal('child "states" fails because ["states" at position 0 fails because [child "shotsIndex" fails because ["shotsIndex" must be larger than or equal to 0]]]');
            done();
          });
      });

      it('should error when url is not prefixed by http', function(done) {
        Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'localhost:8080/test.html', name: 'name'}]})
          .catch(function(err) {
            expect(err.message).to.equal('child "states" fails because ["states" at position 0 fails because [child "url" fails because ["url" with value "localhost:8080/test.html" fails to match the required pattern: /^(http|https):\\/\\//]]]');
            done();
          });
      });

      it('should allow states when url is prefixed by http', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://localhost:8080/test.html', name: 'name'}]})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });
    });

    describe('validate.browsers', function() {
      it('should error when browsers is empty', function(done) {
        Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], browsers: []})
          .catch(function(err) {
            expect(err.message).to.equal('child "browsers" fails because ["browsers" must contain at least 1 items]');
            done();
          });
      });

      it('should error when browsers are not unique', function(done) {
        Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], browsers: [{ browserName: 'chrome' }, { browserName: 'chrome' }], sauce: { username: 'user', accessKey: 'key' }})
          .catch(function(err) {
            expect(err.message).to.equal('child "browsers" fails because ["browsers" position 1 contains a duplicate value]');
            done();
          });
      });

      it('should allow screener browsers with no version', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], browsers: [{ browserName: 'chrome' }, { browserName: 'firefox' }]})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should allow firefox browser with or without version to be backward compatible', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], browsers: [{ browserName: 'firefox', version: '57.0' }]})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should allow browsers to have minor and patch versions', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], browsers: [{ browserName: 'chrome', version: '70.0.1' }, { browserName: 'firefox', version: '57.0' }]})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should error when browser has a major version', function(done) {
        Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], browsers: [{ browserName: 'safari', version: '11' }]})
          .catch(function(err) {
            expect(err.message).to.equal('child "browsers" fails because ["browsers" at position 0 does not match any of the allowed types]');
            done();
          });
      });

      it('should allow internet explorer browser to have major version 11', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], browsers: [{ browserName: 'internet explorer', version: '11' }]})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should error when both sauce and browserStack options are present', function(done) {
        Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], browsers: [{ browserName: 'safari', version: '11.0' }], sauce: { username: 'user', accessKey: 'key' }, browserStack: { username: 'user', accessKey: 'key' }})
          .catch(function(err) {
            expect(err.message).to.equal('"sauce" conflict with forbidden peer "browserStack"');
            done();
          });
      });

      it('should allow browsers with sauce config', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], browsers: [{ browserName: 'safari', version: '11.0' }], sauce: { username: 'user', accessKey: 'key' }})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should allow with sauce.maxConcurrent', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], browsers: [{ browserName: 'safari', version: '11.0' }], sauce: { username: 'user', accessKey: 'key', maxConcurrent: 10 }})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should allow with sauce-specific options', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], browsers: [{ browserName: 'safari', version: '11.0' }], sauce: { username: 'user', accessKey: 'key', maxConcurrent: 10, 'extendedDebugging': true, tunnelIdentifier: 'string', parentTunnel: 'string' }})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should allow browsers with browserStack config', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], browsers: [{ browserName: 'safari', version: '11.0' }], browserStack: { username: 'user', accessKey: 'key' }})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should allow with browserStack.maxConcurrent', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], browsers: [{ browserName: 'safari', version: '11.0' }], browserStack: { username: 'user', accessKey: 'key', maxConcurrent: 10 }})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should allow multiple unique browsers', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], browsers: [{ browserName: 'chrome' }, { browserName: 'firefox' }, { browserName: 'internet explorer', version: '11' }]})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should allow browser includeRules', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], browsers: [{ browserName: 'chrome' }, { browserName: 'firefox' }, { browserName: 'internet explorer', version: '11', includeRules: [/^Button/] }]})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should allow browser excludeRules', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], browsers: [{ browserName: 'chrome' }, { browserName: 'firefox' }, { browserName: 'internet explorer', version: '11', excludeRules: [/^Button/] }]})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });
    });

    describe('validate.sauce', function() {
      it('should forbid tunnelIdentifier when launchSauceConnect is true', function(done) {
        Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], sauce: {username: 'user', accessKey: 'key', launchSauceConnect: true, tunnelIdentifier: 'id'}})
          .catch(function(err) {
            expect(err.message).to.equal('tunnelIdentifier cannot be set when launchSauceConnect flag is enabled');
            done();
          });
      });

      it('should forbid tunnel object when launchSauceConnect is true', function(done) {
        Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], tunnel: {host: 'localhost:8080'}, sauce: {username: 'user', accessKey: 'key', launchSauceConnect: true}})
          .catch(function(err) {
            expect(err.message).to.equal('tunnel option cannot be set when launchSauceConnect flag is enabled');
            done();
          });
      });

      it('should forbid screener browsers when launchSauceConnect is true', function(done) {
        Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], browsers: [{browserName: 'chrome'}], sauce: {username: 'user', accessKey: 'key', launchSauceConnect: true}})
          .catch(function(err) {
            expect(err.message).to.equal('Only Sauce Labs browsers with version can be used when launchSauceConnect flag is enabled');
            done();
          });
      });

      it('should forbid screener browsers(sauce browsers also offered) when launchSauceConnect is true', function(done) {
        Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], browsers: [{browserName: 'internet explorer', version: '11'}, {browserName: 'safari', version: '11.1'}], sauce: {username: 'user', accessKey: 'key', launchSauceConnect: true}})
          .catch(function(err) {
            expect(err.message).to.equal('Only Sauce Labs browsers with version can be used when launchSauceConnect flag is enabled');
            done();
          });
      });

      it('should forbid if browser does not have dot version', function(done) {
        Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], browsers: [{browserName: 'safari', version: '11'}], sauce: {username: 'user', accessKey: 'key', launchSauceConnect: true}})
          .catch(function(err) {
            expect(err.message).to.equal('Only Sauce Labs browsers with version can be used when launchSauceConnect flag is enabled');
            done();
          });
      });

      it('should allow sauce browsers when launchSauceConnect is true', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], browsers: [{ browserName: 'chrome', version: '78.0' }, { browserName: 'firefox', version: '70.0' }, { browserName: 'internet explorer', version: '11.0' }], sauce: {username: 'user', accessKey: 'key', launchSauceConnect: true}})
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

      it('should not allow both resolution and resolutions', function(done) {
        Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], resolution: '1024x768', resolutions: ['1024x768']})
          .catch(function(err) {
            expect(err.message).to.equal('"resolutions" conflict with forbidden peer "resolution"');
            done();
          });
      });

      it('should throw error when resolutions is empty', function(done) {
        Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], resolutions: []})
          .catch(function(err) {
            expect(err.message).to.equal('child "resolutions" fails because ["resolutions" must contain at least 1 items]');
            done();
          });
      });

      it('should throw error when resolutions in incorrect format', function(done) {
        Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], resolutions: 'resolutions'})
          .catch(function(err) {
            expect(err.message).to.equal('child "resolutions" fails because ["resolutions" must be an array]');
            done();
          });
      });
    });

    describe('validate.resolutionSchema', function() {
      it('should throw error when resolution in incorrect format', function(done) {
        Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], resolution: 'resolution'})
          .catch(function(err) {
            expect(err.message).to.equal('child "resolution" fails because ["resolution" with value "resolution" fails to match the resolution pattern, "resolution" must be an object, "resolution" must be an object]');
            done();
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

      it('should throw error when resolution object in incorrect format', function(done) {
        Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [{url: 'http://url.com', name: 'name'}], resolution: {deviceName: 'iPhone 6', width: 1024, height: 768}})
          .catch(function(err) {
            expect(err.message).to.equal('child "resolution" fails because ["resolution" must be a string, "deviceName" is not allowed, "width" is not allowed, "height" is not allowed]');
            done();
          });
      });

      it('should allow resolution includeRules', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], resolutions: [{ width: 1024, height: 768, includeRules: [/^Button/] }]})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });

      it('should allow resolution excludeRules', function() {
        return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], resolutions: [{ deviceName: 'iPhone 6', excludeRules: [/^Button/] }]})
          .catch(function() {
            throw new Error('Should not be here');
          });
      });
    });
  });

  describe('validate.shots', function() {
    it('should throw error when shots is empty', function(done) {
      Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], shots: []})
        .catch(function(err) {
          expect(err.message).to.equal('child "shots" fails because ["shots" must contain at least 1 items]');
          done();
        });
    });

    it('should throw error when required fields are missing', function(done) {
      Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], shots: [{name: 'name'}]})
        .catch(function(err) {
          expect(err.message).to.equal('child "shots" fails because ["shots" at position 0 fails because [child "resolution" fails because ["resolution" is required]]]');
          done();
        });
    });

    it('should allow shots items with name, resolution, shotsDir', function() {
      return Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], shots: [{name: 'name', resolution: '1024x768', shotsDir: '/tmp/shots'}, {name: 'name2', resolution: '1024x768', shotsDir: '/tmp/shots'}]})
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

    it('should error when resolution is invalid format', function(done) {
      Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], shots: [{name: 'name', resolution: 'desktop', shotsDir: '/tmp/shots'}]})
        .catch(function(err) {
          expect(err.message).to.equal('child "shots" fails because ["shots" at position 0 fails because [child "resolution" fails because ["resolution" with value "desktop" fails to match the resolution pattern]]]');
          done();
        });
    });

    it('should error when duplicate shots items are found', function(done) {
      Validate.runnerConfig({apiKey: 'key', projectRepo: 'repo', states: [], shots: [{name: 'name', resolution: '1024x768', shotsDir: '/tmp/shots'}, {name: 'name', resolution: '1024x768', shotsDir: '/tmp/shots'}]})
        .catch(function(err) {
          expect(err.message).to.equal('child "shots" fails because ["shots" position 1 contains a duplicate value]');
          done();
        });
    });
  });

  describe('validate.steps', function() {
    it('should error when value not array', function(done) {
      Validate.steps('test')
        .catch(function(err) {
          expect(err.message).to.equal('"value" must be an array');
          done();
        });
    });

    it('should error when step with invalid type added', function(done) {
      var steps = [
        {
          type: 'type',
          name: 'hello'
        }
      ];
      Validate.steps(steps)
        .catch(function(err) {
          expect(err.message).to.equal('"value" at position 0 does not match any of the allowed types');
          done();
        });
    });

    it('should error when valid step with extra property is added', function(done) {
      var testSteps = [
        {
          type: 'saveScreenshot',
          name: 'hello',
          extra: 'prop'
        }
      ];
      Validate.steps(testSteps)
        .catch(function(err) {
          expect(err.message).to.equal('"value" at position 0 does not match any of the allowed types');
          done();
        });
    });

    it('should error with invalid url format', function(done) {
      var steps = [
        {
          type: 'url',
          url: '/path'
        }
      ];
      Validate.steps(steps)
        .catch(function(err) {
          expect(err.message).to.equal('"value" at position 0 does not match any of the allowed types');
          done();
        });
    });

    it('should allow valid url format', function() {
      var steps = [
        {
          type: 'url',
          url: 'http://url.com'
        }
      ];
      return Validate.steps(steps)
        .catch(function() {
          throw new Error('Should not be here');
        });
    });

  });
});
