var sauceConnectLauncher = require('sauce-connect-launcher');
var SAUCE_CONNECT_LAUNCHER_VERSION = '4.5.4';

sauceConnectLauncher.download({
  logger: console.log.bind(console),
  version: SAUCE_CONNECT_LAUNCHER_VERSION,
}, function (err) {
  if (err) {
    console.log(`Failed to download sauce connect binary: ${err}`);
    console.log('sauce-connect-launcher will attempt to re-download next time it is run.');
  }
});
