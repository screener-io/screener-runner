var assign = require('lodash/assign');

exports.setVars = function(source) {
  // get and inject CI vars
  return assign(exports.getVars(), source);
};

exports.getVars = function() {
  var env = process.env;
  // Jenkins
  if (typeof env.JENKINS_URL === 'string' && env.JENKINS_URL.length > 0) {
    return {
      build: env.BUILD_NUMBER,
      branch: env.GIT_BRANCH,
      commit: env.GIT_COMMIT
    };
  }
  // CircleCI
  if (env.CI === 'true' && env.CIRCLECI === 'true') {
    return {
      build: env.CIRCLE_BUILD_NUM,
      branch: env.CIRCLE_BRANCH,
      commit: env.CIRCLE_SHA1
    };
  }
  // Travis CI
  if (env.CI === 'true' && env.TRAVIS === 'true') {
    return {
      build: env.TRAVIS_BUILD_NUMBER,
      branch: env.TRAVIS_BRANCH,
      commit: env.TRAVIS_COMMIT
    };
  }
  // Codeship
  if (env.CI === 'true' && env.CI_NAME === 'codeship') {
    return {
      build: env.CI_BUILD_NUMBER,
      branch: env.CI_BRANCH,
      commit: env.CI_COMMIT_ID
    };
  }
  // Bitbucket
  if (env.BITBUCKET_BRANCH && env.BITBUCKET_COMMIT) {
    return {
      branch: env.BITBUCKET_BRANCH,
      commit: env.BITBUCKET_COMMIT
    };
  }
  // Drone
  if (env.CI === 'true' && env.DRONE === 'true') {
    return {
      build: env.DRONE_BUILD_NUMBER,
      branch: env.DRONE_BRANCH,
      commit: env.DRONE_COMMIT
    };
  }
  // Semaphore
  if (env.CI === 'true' && env.SEMAPHORE === 'true') {
    return {
      build: env.SEMAPHORE_BUILD_NUMBER,
      branch: env.BRANCH_NAME,
      commit: env.REVISION
    };
  }
  // if no matches, return empty object
  return {};
};
