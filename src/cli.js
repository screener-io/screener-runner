var program = require('commander');
var fs = require('fs');
var path = require('path');
var pjson = require('../package.json');
var Runner = require('./runner');

program
  .version(pjson.version)
  .option('-c, --conf <config-file>', 'Path to Configuration File')
  .parse(process.argv);

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

Runner.run(config)
  .then(function(response) {
    console.log(response);
    process.exit();
  })
  .catch(function(err) {
    console.error(err.message || err.toString());
    console.error('---');
    console.error('Exiting Screener Runner');
    console.error('Need help? Contact: support@screener.io');
    process.exit(1);
  });
