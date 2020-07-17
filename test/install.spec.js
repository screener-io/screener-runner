var chai = require('chai');
chai.use(require('chai-fs'));
var expect = chai.expect;
var path = require('path');
var SAUCE_CONNECT_LAUNCHER_VERSION = '4.6.2';
var PLATFORM = {
  darwin: 'osx',
  win32: 'win32',
}[process.platform] || 'linux';

describe('Sauce Connect Launcher', function() {
  it('should be downloaded after screener runner is installed', function() {
    expect(path.resolve(`./node_modules/sauce-connect-launcher/sc/sc-${SAUCE_CONNECT_LAUNCHER_VERSION}-${PLATFORM}/bin/sc`)).to.be.a.file('Didn\'t download sauce connect launcher correctly');
  });
});
