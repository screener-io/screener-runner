var assign = require('lodash/assign');
var clone = require('lodash/clone');

exports.setVars = function(source) {
  var copy = clone(source);
  // clear empty build, branch or commit
  if (!copy.build) {
    delete copy.build;
  }
  if (!copy.branch) {
    delete copy.branch;
  }
  if (!copy.commit) {
    delete copy.commit;
  }
  // get and inject CI vars
  return assign(exports.getVars(), copy);
};

exports.getVars = function() {
  var env = process.env;
  // Jenkins
  if ((typeof env.JENKINS_URL === 'string' && env.JENKINS_URL.length > 0) || (typeof env.JENKINS_HOME === 'string' && env.JENKINS_HOME.length > 0)) {
    return {
      build: env.BUILD_NUMBER,
      branch: env.ghprbSourceBranch || env.GIT_BRANCH,
      commit: env.ghprbActualCommit || env.GIT_COMMIT
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
    var fullBranchName = env.TRAVIS_PULL_REQUEST_BRANCH || env.TRAVIS_BRANCH;
    var prSlug = env.TRAVIS_PULL_REQUEST_SLUG;
    // if PR src and dest branches are equal, prefix with slug to differentiate 
    if (prSlug && env.TRAVIS_PULL_REQUEST_BRANCH === env.TRAVIS_BRANCH) {
      fullBranchName = prSlug + ':' + fullBranchName;
    }
    return {
      build: env.TRAVIS_BUILD_NUMBER,
      branch: fullBranchName,
      commit: env.TRAVIS_PULL_REQUEST_SHA || env.TRAVIS_COMMIT,
      repoSlug: env.TRAVIS_REPO_SLUG
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
  // GitLab
  if (env.CI === 'true' && env.GITLAB_CI === 'true') {
    return {
      build: env.CI_JOB_ID || env.CI_BUILD_ID,
      branch: env.CI_COMMIT_REF_NAME || env.CI_BUILD_REF_NAME,
      commit: env.CI_COMMIT_SHA || env.CI_BUILD_REF
    };
  }
  // Buildkite
  if (env.CI === 'true' && env.BUILDKITE === 'true') {
    return {
      build: env.BUILDKITE_BUILD_NUMBER,
      branch: env.BUILDKITE_BRANCH,
      commit: env.BUILDKITE_COMMIT
    };
  }
  // Visual Studio Team Services
  if (env.TF_BUILD === 'True') {
    var branchName = env.SYSTEM_PULLREQUEST_SOURCEBRANCH || env.BUILD_SOURCEBRANCHNAME;
    // remove prefix if exists
    if (branchName.indexOf('refs/heads/') === 0) {
      branchName = branchName.replace('refs/heads/', '');
    }
    var result = {
      build: env.BUILD_BUILDID,
      branch: branchName,
      commit: env.BUILD_SOURCEVERSION,
    };
    // get pull request id if exists
    if (env.SYSTEM_PULLREQUEST_PULLREQUESTID) {
      result.pullRequest = env.SYSTEM_PULLREQUEST_PULLREQUESTID.toString();
    }
    return result;
  }
  // if no matches, return empty object
  return {};
};
