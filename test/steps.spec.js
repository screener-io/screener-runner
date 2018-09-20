var expect = require('chai').expect;
var Steps = require('../src/steps');

describe('screener-runner/src/steps', function() {
  describe('new Steps()', function() {
    it('should initialize steps array', function() {
      var test = new Steps();
      expect(test.steps).to.deep.equal([]);
    });
  });

  describe('Steps.prototype.url', function() {
    it('should add url step', function() {
      var test = new Steps().url('https://screener.io');
      expect(test.steps).to.deep.equal([
        {
          type: 'url',
          url: 'https://screener.io'
        }
      ]);
    });
  });

  describe('Steps.prototype.snapshot', function() {
    it('should add snapshot step', function() {
      var test = new Steps().snapshot('name');
      expect(test.steps).to.deep.equal([
        {
          type: 'saveScreenshot',
          name: 'name'
        }
      ]);
    });

    it('should add cropped snapshot step', function() {
      var test = new Steps().snapshot('name', {cropTo: '.selector'});
      expect(test.steps).to.deep.equal([
        {
          type: 'cropScreenshot',
          name: 'name',
          locator: {
            type: 'css selector',
            value: '.selector'
          }
        }
      ]);
    });
  });

  describe('Steps.prototype.click', function() {
    it('should add click step', function() {
      var test = new Steps().click('selector');
      expect(test.steps).to.deep.equal([
        {
          type: 'clickElement',
          locator: {
            type: 'css selector',
            value: 'selector'
          }
        }
      ]);
    });
  });

  describe('Steps.prototype.hover', function() {
    it('should add hover step', function() {
      var test = new Steps().hover('selector');
      expect(test.steps).to.deep.equal([
        {
          type: 'moveTo',
          locator: {
            type: 'css selector',
            value: 'selector'
          }
        }
      ]);
    });
  });

  describe('Steps.prototype.mouseDown', function() {
    it('should add mouseDown step', function() {
      var test = new Steps().mouseDown();
      expect(test.steps).to.deep.equal([
        {
          type: 'clickAndHoldElement'
        }
      ]);
    });

    it('should add mouseDown step with optional selector', function() {
      var test = new Steps().mouseDown('selector');
      expect(test.steps).to.deep.equal([
        {
          type: 'clickAndHoldElement',
          locator: {
            type: 'css selector',
            value: 'selector'
          }
        }
      ]);
    });
  });

  describe('Steps.prototype.mouseUp', function() {
    it('should add mouseUp step', function() {
      var test = new Steps().mouseUp();
      expect(test.steps).to.deep.equal([
        {
          type: 'releaseElement'
        }
      ]);
    });

    it('should add mouseUp step with optional selector', function() {
      var test = new Steps().mouseUp('selector');
      expect(test.steps).to.deep.equal([
        {
          type: 'releaseElement',
          locator: {
            type: 'css selector',
            value: 'selector'
          }
        }
      ]);
    });
  });

  describe('Steps.prototype.setValue', function() {
    it('should add setValue step', function() {
      var test = new Steps().setValue('selector', 'text');
      expect(test.steps).to.deep.equal([
        {
          type: 'setElementText',
          locator: {
            type: 'css selector',
            value: 'selector'
          },
          text: 'text'
        }
      ]);
    });
  });

  describe('Steps.prototype.executeScript', function() {
    it('should add executeScript step', function() {
      var test = new Steps().executeScript('code');
      expect(test.steps).to.deep.equal([
        {
          type: 'executeScript',
          code: 'code'
        }
      ]);
    });

    it('should add async executeScript step', function() {
      var test = new Steps().executeScript('code', true);
      expect(test.steps).to.deep.equal([
        {
          type: 'executeScript',
          code: 'code',
          isAsync: true
        }
      ]);
    });
  });

  describe('Steps.prototype.ignore', function() {
    it('should add ignore step', function() {
      var test = new Steps().ignore('selector');
      expect(test.steps).to.deep.equal([
        {
          type: 'ignoreElements',
          locator: {
            type: 'css selector',
            value: 'selector'
          }
        }
      ]);
    });
  });

  describe('Steps.prototype.wait', function() {
    it('should add pause step', function() {
      var test = new Steps().wait(300);
      expect(test.steps).to.deep.equal([
        {
          type: 'pause',
          waitTime: 300
        }
      ]);
    });

    it('should add wait for element step', function() {
      var test = new Steps().wait('selector');
      expect(test.steps).to.deep.equal([
        {
          type: 'waitForElementPresent',
          locator: {
            type: 'css selector',
            value: 'selector'
          }
        }
      ]);
    });
  });

  describe('Steps.prototype.rtl', function() {
    it('should add script to set direction to rtl', function() {
      var test = new Steps().rtl();
      expect(test.steps).to.deep.equal([
        {
          type: 'executeScript',
          code: 'document.documentElement.dir = "rtl";'
        }
      ]);
    });
  });

  describe('Steps.prototype.ltr', function() {
    it('should add script to set direction to ltr', function() {
      var test = new Steps().ltr();
      expect(test.steps).to.deep.equal([
        {
          type: 'executeScript',
          code: 'document.documentElement.dir = "ltr";'
        }
      ]);
    });
  });

  describe('Steps.prototype.end', function() {
    it('should return steps', function() {
      var result = new Steps()
        .url('https://screener.io')
        .snapshot('State Name')
        .click('selector')
        .hover('selector')
        .setValue('selector', 'text')
        .executeScript('code')
        .executeScript('code', true)
        .ignore('selector')
        .wait(300)
        .wait('msOrSelector')
        .end();
      expect(result).to.deep.equal([
        {
          type: 'url',
          url: 'https://screener.io'
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
      ]);
    });
  });

});
