var Joi = require('joi');
var Promise = require('bluebird');

var includeRulesSchema = exports.includeRulesSchema = Joi.array().min(0).items(
  Joi.string(),
  Joi.object().type(RegExp)
);

var excludeRulesSchema = exports.excludeRulesSchema = Joi.array().min(0).items(
  Joi.string(),
  Joi.object().type(RegExp)
);

var resolutionSchema = exports.resolutionSchema = Joi.alternatives().try(
  Joi.string().regex(/^[0-9]{3,4}x[0-9]{3,4}$/, 'resolution'),
  Joi.object().keys({
    width: Joi.number().min(320).max(1920).required(),
    height: Joi.number().min(320).max(1920).required(),
    userAgent: Joi.string(),
    includeRules: includeRulesSchema,
    excludeRules: excludeRulesSchema
  }),
  Joi.object().keys({
    deviceName: Joi.string().required(),
    deviceOrientation: Joi.string().valid('portrait', 'landscape'),
    includeRules: includeRulesSchema,
    excludeRules: excludeRulesSchema
  })
);

var browsersSchema = exports.browsersSchema = Joi.array().min(1).unique().items(
  Joi.object().keys({
    browserName: Joi.string().valid(['chrome', 'firefox']).required(),
    includeRules: includeRulesSchema,
    excludeRules: excludeRulesSchema
  }),
  Joi.object().keys({
    browserName: Joi.string().valid(['chrome', 'firefox', 'safari', 'microsoftedge', 'internet explorer']).required(),
    version: Joi.string().required(),
    includeRules: includeRulesSchema,
    excludeRules: excludeRulesSchema
  })
);

var sauceSchema = exports.sauceSchema = Joi.object().keys({
  username: Joi.string().required(),
  accessKey: Joi.string().required(),
  maxConcurrent: Joi.number(),
  extendedDebugging: Joi.boolean(),
  tunnelIdentifier: Joi.string(),
  parentTunnel: Joi.string()
});

var vstsSchema = exports.vstsSchema = Joi.object().keys({
  instance: Joi.string().required()
});

var browserStackSchema = exports.browserStackSchema = Joi.object().keys({
  username: Joi.string().required(),
  accessKey: Joi.string().required(),
  maxConcurrent: Joi.number()
});

var uniqShotGroup = function(a, b) {
  return a.name === b.name && a.resolution === b.resolution;
};
var shotsSchema = exports.shotsSchema = Joi.array().min(1).items(
  Joi.object().keys({
    name: Joi.string().required(),
    resolution: Joi.string().regex(/^[0-9]{3,4}x[0-9]{3,4}$/, 'resolution').required(),
    shotsDir: Joi.string().required()
  })
).unique(uniqShotGroup);

var stepsSchema = exports.stepsSchema = Joi.array().min(0).items(
  Joi.object().keys({
    type: Joi.string().valid('url').required(),
    url: Joi.string().uri().required()
  }),
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
    type: Joi.string().valid(['moveTo', 'clickAndHoldElement', 'releaseElement', 'ignoreElements', 'clearElementText']).required(),
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
    text: Joi.string().allow('').required(),
    isPassword: Joi.boolean()
  }),
  Joi.object().keys({
    type: Joi.string().valid(['clickElement', 'waitForElementPresent', 'waitForElementNotPresent']).required(),
    locator: Joi.object().keys({
      type: Joi.string().valid('css selector').required(),
      value: Joi.string().required()
    }),
    maxTime: Joi.number().integer().positive()
  }),
  Joi.object().keys({
    type: Joi.string().valid('sendKeys').required(),
    locator: Joi.object().keys({
      type: Joi.string().valid('css selector').required(),
      value: Joi.string().required()
    }),
    keys: Joi.string().allow('').required()
  }),
  Joi.object().keys({
    type: Joi.string().valid('executeScript').required(),
    code: Joi.string().required(),
    isAsync: Joi.boolean()
  }),
  Joi.object().keys({
    type: Joi.string().valid('pause').required(),
    waitTime: Joi.number().required()
  }),
  Joi.object().keys({
    type: Joi.string().valid('cssAnimations').required(),
    isEnabled: Joi.boolean()
  }),
  Joi.object().keys({
    type: Joi.string().valid('clearIgnores').required()
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
  includeRules: includeRulesSchema,
  excludeRules: excludeRulesSchema,
  shots: shotsSchema,
  states: Joi.array().min(0).items(
    Joi.object().keys({
      url: Joi.string().uri().required(),
      name: Joi.string().max(200).required(),
      steps: stepsSchema,
      shotsIndex: Joi.number().integer().min(0)
    })
  ).required(),
  tunnel: Joi.object().keys({
    host: Joi.string().required(),
    gzip: Joi.boolean(),
    cache: Joi.boolean()
  }),
  baseBranch: Joi.string().max(100),
  initialBaselineBranch: Joi.string().max(100),
  disableBranchBaseline: Joi.boolean(),
  disableConcurrency: Joi.boolean(),
  useNewerBaseBranch: Joi.string().valid(['accepted', 'latest']),
  diffOptions: Joi.object().keys({
    structure: Joi.boolean(),
    layout: Joi.boolean(),
    style: Joi.boolean(),
    content: Joi.boolean(),
    minLayoutPosition: Joi.number().integer().min(0),
    minLayoutDimension: Joi.number().integer().min(0),
    minShiftGraphic: Joi.number().integer().min(0),
    compareSVGDOM: Joi.boolean()
  }),
  sauce: sauceSchema,
  vsts: vstsSchema,
  browserStack: browserStackSchema,
  meta: Joi.object(),
  failOnNewStates: Joi.boolean(),
  alwaysAcceptBaseBranch: Joi.boolean(),
  disableAutoSnapshots: Joi.boolean(),
  newSessionForEachState: Joi.boolean(),
  failureExitCode: Joi.number().integer().min(0).max(255).default(1),
  beforeEachScript: [Joi.func(), Joi.string()],
  ieNativeEvents: Joi.boolean()
})
  .without('resolutions', ['resolution'])
  .without('sauce', ['browserStack'])
  .with('disableBranchBaseline', ['baseBranch'])
  .with('useNewerBaseBranch', ['baseBranch'])
  .with('alwaysAcceptBaseBranch', ['baseBranch'])
  .required();

exports.runnerConfig = function(value) {
  var validator = Promise.promisify(Joi.validate);
  return validator(value, runnerSchema);
};

exports.steps = function(value) {
  return Joi.validate(value, stepsSchema);
};
