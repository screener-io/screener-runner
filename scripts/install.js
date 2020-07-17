var sauceConnectLauncher = require('sauce-connect-launcher');
var SAUCE_CONNECT_LAUNCHER_VERSION = '4.6.2';

sauceConnectLauncher.download({
  logger: console.log.bind(console),
  version: SAUCE_CONNECT_LAUNCHER_VERSION,
}, function (err) {
  if (err) {
    console.error(`Failed to download sauce connect binary: ${err}`);
    console.log('sauce-connect-launcher will attempt to re-download next time when you run: npm install.');
    process.exit(1);
  }
});
