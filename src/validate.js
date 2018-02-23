var Joi = require('joi');
var Promise = require('bluebird');

var resolutionSchema = exports.resolutionSchema = Joi.alternatives().try(
  Joi.string().regex(/^[0-9]{3,4}x[0-9]{3,4}$/, 'resolution'),
  Joi.object().keys({
    width: Joi.number().min(320).max(1920).required(),
    height: Joi.number().min(320).max(1920).required(),
    userAgent: Joi.string()
  }),
  Joi.object().keys({
    deviceName: Joi.string().required(),
    deviceOrientation: Joi.string().valid('portrait', 'landscape')
  })
);

var browsersSchema = exports.browsersSchema = Joi.array().min(1).unique().items(
  Joi.object().keys({
    browserName: Joi.string().valid(['chrome', 'firefox']).required()
  }),
  Joi.object().keys({
    browserName: Joi.string().valid(['firefox', 'safari', 'microsoftedge', 'internet explorer']).required(),
    version: Joi.string().required()
  })
);

var sauceSchema = exports.sauceSchema = Joi.object().keys({
  username: Joi.string().required(),
  accessKey: Joi.string().required(),
  maxConcurrent: Joi.number()
});

var vstsSchema = exports.vstsSchema = Joi.object().keys({
  instance: Joi.string().required()
});

var stepsSchema = exports.stepsSchema = Joi.array().min(0).items(
  Joi.object().keys({
    type: Joi.string().valid('saveScreenshot').required(),
    name: Joi.string().max(200).required()
  }),
  Joi.object().keys({
    type: Joi.string().valid('cropScreenshot').required(),
    name: Joi.string().max(200).required(),
    locator: Joi.object().keys({
      type: Joi.string().valid('css selector').required(),
      value: Joi.string().required()
    }).required()
  }),
  Joi.object().keys({
    type: Joi.string().valid(['clickElement', 'moveTo', 'clickAndHoldElement', 'releaseElement', 'ignoreElements', 'waitForElementPresent']).required(),
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
);

var runnerSchema = Joi.object().keys({
  apiKey: Joi.string().required(),
  projectRepo: Joi.string().max(100).required(),
  build: Joi.string().max(40),
  branch: Joi.string().max(100),
  commit: Joi.string(),
  pullRequest: Joi.string(),
  resolution: resolutionSchema,
  resolutions: Joi.array().min(1).items(
    resolutionSchema
  ),
  browsers: browsersSchema,
  cssAnimations: Joi.boolean(),
  ignore: Joi.string(),
  hide: Joi.string(),
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
      name: Joi.string().max(200).required(),
      steps: stepsSchema
    })
  ).required(),
  tunnel: Joi.object().keys({
    host: Joi.string().required(),
    gzip: Joi.boolean(),
    cache: Joi.boolean()
  }),
  baseBranch: Joi.string().max(100),
  initialBaselineBranch: Joi.string().max(100),
  diffOptions: Joi.object().keys({
    structure: Joi.boolean(),
    layout: Joi.boolean(),
    style: Joi.boolean(),
    content: Joi.boolean(),
    minLayoutPosition: Joi.number().integer().min(0),
    minLayoutDimension: Joi.number().integer().min(0)
  }),
  sauce: sauceSchema,
  vsts: vstsSchema,
  meta: Joi.object(),
  failOnNewStates: Joi.boolean(),
  failureExitCode: Joi.number().integer().min(0).max(255).default(1),
  beforeEachScript: [Joi.func(), Joi.string()]
}).without('resolutions', ['resolution']).required();

exports.runnerConfig = function(value) {
  var validator = Promise.promisify(Joi.validate);
  return validator(value, runnerSchema);
};

exports.steps = function(value) {
  return Joi.validate(value, stepsSchema);
};
