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
