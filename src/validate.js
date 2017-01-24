var Joi = require('joi');
var Promise = require('bluebird');

exports.runnerConfig = function(value) {
  var schema = Joi.object().keys({
    apiKey: Joi.string().required(),
    projectRepo: Joi.string().max(100).required(),
    build: Joi.string().max(40),
    branch: Joi.string().max(100),
    resolution: Joi.string().regex(/^[0-9]{3,4}x[0-9]{3,4}$/, 'resolution'),
    ignore: Joi.string(),
    includeRules: Joi.array().min(0).items(
      Joi.string(),
      Joi.object().type(RegExp)
    ),
    excludeRules: Joi.array().min(0).items(
      Joi.string(),
      Joi.object().type(RegExp)
    ),
    states: Joi.array().min(0).items(
      Joi.object().keys({
        url: Joi.string().uri().required(),
        name: Joi.string().max(100).required()
      })
    ).required(),
    tunnel: Joi.object().keys({
      host: Joi.string().required(),
      gzip: Joi.boolean()
    }),
    diffOptions: Joi.object().keys({
      structure: Joi.boolean(),
      layout: Joi.boolean(),
      style: Joi.boolean(),
      content: Joi.boolean()
    })
  }).required();
  var validator = Promise.promisify(Joi.validate);
  return validator(value, schema);
};

exports.steps = function(value) {
  var schema = Joi.array().min(0).items(
    Joi.object().keys({
      type: Joi.string().valid('saveScreenshot').required(),
      name: Joi.string().required()
    }),
    Joi.object().keys({
      type: Joi.string().valid(['clickElement', 'moveTo', 'ignoreElements', 'waitForElementPresent']).required(),
      locator: Joi.object().keys({
        type: Joi.string().valid('css selector').required(),
        value: Joi.string().required()
      })
    }),
    Joi.object().keys({
      type: Joi.string().valid('setElementText').required(),
      locator: Joi.object().keys({
        type: Joi.string().valid('css selector').required(),
        value: Joi.string().required()
      }),
      text: Joi.string().required()
    }),
    Joi.object().keys({
      type: Joi.string().valid('executeScript').required(),
      code: Joi.string().required(),
      isAsync: Joi.boolean()
    }),
    Joi.object().keys({
      type: Joi.string().valid('pause').required(),
      waitTime: Joi.number().required()
    })
  ).required();
  return Joi.validate(value, schema);
};
