var program = require('commander');
var fs = require('fs');
var path = require('path');
var pjson = require('../package.json');
var colors = require('colors/safe');
var Runner = require('./runner');

program
  .version(pjson.version)
  .option('-c, --conf <config-file>', 'Path to Configuration File')
  .parse(process.argv);

console.log(colors.bold('\nscreener-runner v' + pjson.version + '\n'));

if (!program.conf) {
  console.error('--conf is a required argument. Type --help for more information.');
  process.exit(1);
}

var configPath = path.resolve(process.cwd(), program.conf);
if (!fs.existsSync(configPath)) {
  console.error('Config file path "' + program.conf + '" cannot be found.');
  process.exit(1);
}

var config = require(configPath);

if (config === false) {
  console.log('Config is false. Exiting...');
  process.exit();
}

Runner.run(config)
  .then(function(response) {
    console.log(response);
    process.exit();
  })
  .catch(function(err) {
    console.error(err.message || err.toString());
    if (typeof err.annotate === 'function') {
      console.error('Annotated Error Details:');
      console.error(err.annotate());
    }
    console.error('---');
    console.error('Exiting Screener Runner');
    console.error('Need help? Contact: support@screener.io');
    var exitCode = 1;
    if (config && typeof config.failureExitCode === 'number' && config.failureExitCode > 0) {
      exitCode = config.failureExitCode;
    }
    process.exit(exitCode);
  });
