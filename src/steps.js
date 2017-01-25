function Steps() {
  this.steps = [];
}

Steps.prototype.snapshot = function(name) {
  var step = {
    type: 'saveScreenshot',
    name: name
  };
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

Steps.prototype.end = function() {
  return this.steps;
};

module.exports = Steps;
