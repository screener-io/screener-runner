var chai = require('chai');
chai.use(require('chai-fs'));
var expect = chai.expect;
var path = require('path');
var SAUCE_CONNECT_LAUNCHER_VERSION = 'v4.6.2';

describe('Sauce Connect Launcher', function() {
  it('should be downloaded after screener runner is installed', function() {
    expect(path.resolve(`${process.cwd()}/node_modules/saucelabs/build/.sc-${SAUCE_CONNECT_LAUNCHER_VERSION}/bin/sc`)).to.be.a.file('Didn\'t download sauce connect launcher correctly');
  });
});
