var connect = require('connect');
var http = require('http');
var httpProxy = require('http-proxy');
var compression = require('compression');
var portfinder = require('portfinder');
var Promise = require('bluebird');
var request = require('request');
var Cache = {};

var startGzipProxyServer = function(options, callback) {
  var app = connect();

  var proxy = httpProxy.createProxyServer({
    target: 'http://' + options.targetHost
  });

  // gzip/deflate outgoing responses
  app.use(compression());

  app.use(function(req, res, next) {
    if (options.cache) {
      // monkey-patch res.writeHead with cache-control header
      res.oldWriteHead = res.writeHead;
      res.writeHead = function(statusCode, headers) {
        res.setHeader('cache-control', 'public, max-age=900');
        res.oldWriteHead(statusCode, headers);
      };
    }
    next();
  });

  // handle requests
  app.use(function(req, res, next) {
    if (!options.cache) {
      return next();
    }
    var cached = Cache[req.url];
    if (cached) {
      // serve from cache
      res.writeHead(200, cached.headers);
      res.write(cached.body);
      res.end();
    } else if (req.method === 'GET' && req.url.indexOf('/') === 0 && /\.js$/.test(req.url)) {
      // cache all JS requests in-memory
      request.get('http://' + options.targetHost + req.url, function(err, response, body) {
        // fallback to proxy request on error
        if (err) return next();
        var headers = {
          'content-type': 'application/javascript'
        };
        Cache[req.url] = {
          headers: headers,
          body: body
        };
        res.writeHead(200, headers);
        res.write(body);
        res.end();
      });
    } else next();
  });

  app.use(function(req, res) {
    // proxy requests
    proxy.web(req, res);
  });

  // ensure proxied requests have connection set to keep-alive
  // to fix closed connection issues resulting in 502 Bad Gateway errors
  proxy.on('proxyReq', function(proxyReq) {
    proxyReq.setHeader('connection', 'keep-alive');
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

exports.startServer = function(options) {
  var startServer = Promise.promisify(startGzipProxyServer);
  return startServer(options);
};
