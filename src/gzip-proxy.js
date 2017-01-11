var connect = require('connect');
var http = require('http');
var httpProxy = require('http-proxy');
var compression = require('compression');
var portfinder = require('portfinder');
var Promise = require('bluebird');

var startGzipProxyServer = function(targetHost, callback) {
  var app = connect();

  var proxy = httpProxy.createProxyServer({
    target: 'http://' + targetHost
  });

  // gzip/deflate outgoing responses
  app.use(compression());

  // proxy all requests
  app.use(function(req, res) {
    proxy.web(req, res);
  });

  // find free port
  portfinder.getPort(function (err, port) {
    if (err) return callback(err);

    // start proxy server
    http.createServer(app).listen(port, function(err) {
      if (err) return callback(err);
      var proxyHost = 'localhost:' + port;
      callback(null, proxyHost);
    });
  });
};

exports.startServer = function(targetHost) {
  var startServer = Promise.promisify(startGzipProxyServer);
  return startServer(targetHost);
};
