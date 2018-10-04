function Steps() {
  this.steps = [];
}

Steps.prototype.url = function(url) {
  var step = {
    type: 'url',
    url: url
  };
  this.steps.push(step);
  return this;
};

Steps.prototype.snapshot = function(name, opts) {
  var step = {
    type: 'saveScreenshot',
    name: name
  };
  if (opts && typeof opts.cropTo === 'string') {
    step.type = 'cropScreenshot';
    step.locator = {
      type: 'css selector',
      value: opts.cropTo
    };
  }
  this.steps.push(step);
  return this;
};

Steps.prototype.click = function(selector) {
  var step = {
    type: 'clickElement',
    locator: {
      type: 'css selector',
      value: selector
    }
  };
  this.steps.push(step);
  return this;
};

Steps.prototype.hover = function(selector) {
  var step = {
    type: 'moveTo',
    locator: {
      type: 'css selector',
      value: selector
    }
  };
  this.steps.push(step);
  return this;
};

Steps.prototype.mouseDown = function(selector) {
  var step = {
    type: 'clickAndHoldElement'
  };
  if (selector) {
    step.locator = {
      type: 'css selector',
      value: selector
    };
  }
  this.steps.push(step);
  return this;
};

Steps.prototype.mouseUp = function(selector) {
  var step = {
    type: 'releaseElement'
  };
  if (selector) {
    step.locator = {
      type: 'css selector',
      value: selector
    };
  }
  this.steps.push(step);
  return this;
};

Steps.prototype.setValue = function(selector, text) {
  var step = {
    type: 'setElementText',
    locator: {
      type: 'css selector',
      value: selector
    },
    text: text
  };
  this.steps.push(step);
  return this;
};

Steps.prototype.keys = function(selector, keys) {
  var step = {
    type: 'sendKeys',
    locator: {
      type: 'css selector',
      value: selector
    },
    keys: keys
  };
  this.steps.push(step);
  return this;
};

Steps.prototype.focus = function(selector) {
  return this.keys(selector, '');
};

// isAsync requires a "done()" method to be called
Steps.prototype.executeScript = function(code, isAsync) {
  var step = {
    type: 'executeScript',
    code: code
  };
  if (isAsync === true) {
    step.isAsync = true;
  }
  this.steps.push(step);
  return this;
};

Steps.prototype.ignore = function(selector) {
  var step = {
    type: 'ignoreElements',
    locator: {
      type: 'css selector',
      value: selector
    }
  };
  this.steps.push(step);
  return this;
};

Steps.prototype.wait = function(msOrSelector) {
  var step;
  if (typeof msOrSelector === 'number') {
    step = {
      type: 'pause',
      waitTime: msOrSelector
    };
  } else {
    step = {
      type: 'waitForElementPresent',
      locator: {
        type: 'css selector',
        value: msOrSelector
      }
    };
  }
  this.steps.push(step);
  return this;
};

Steps.prototype.rtl = function() {
  var step = {
    type: 'executeScript',
    code: 'document.documentElement.dir = "rtl";'
  };
  this.steps.push(step);
  return this;
};

Steps.prototype.ltr = function() {
  var step = {
    type: 'executeScript',
    code: 'document.documentElement.dir = "ltr";'
  };
  this.steps.push(step);
  return this;
};

Steps.prototype.cssAnimations = function(isEnabled) {
  var step = {
    type: 'cssAnimations',
    isEnabled: isEnabled
  };
  this.steps.push(step);
  return this;
};

Steps.prototype.end = function() {
  return this.steps;
};

module.exports = Steps;
