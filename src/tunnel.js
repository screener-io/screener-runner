var ngrok = require('screener-ngrok');
var Promise = require('bluebird');
var url = require('url');

exports.connect = function(host, token, tries = 0) {
  if (!token) {
    return Promise.reject(new Error('No Tunnel Token'));
  }
  var urlObj = url.parse('http://' + host);
  var port = urlObj.port || 80;
  var hostHeader = urlObj.hostname;
  // include port in host header when not default port 80
  if (port !== 80) {
    hostHeader += ':' + port;
  }
  var options = {
    addr: urlObj.hostname + ':' + port,
    host_header: hostHeader,
    bind_tls: true,
    authtoken: token
  };
  var connect = Promise.promisify(ngrok.connect);
  return connect(options)
    .then(tunnelUrl => {
      var urlObj = url.parse(tunnelUrl);
      console.log('Connected private encrypted tunnel to ' + host + ' (' + urlObj.host.split('.')[0] + ')');
      return urlObj.host;
    })
    .catch(ex => {
      if (tries < 2) {
        // on error, wait and retry
        return Promise.delay(1000).then(() =>
          exports.connect(host, token, tries + 1)
        );
      }
      throw ex;
    });
};

exports.transformUrl = function(origUrl, host, tunnelHost) {
  var urlObj = url.parse(origUrl);
  var newUrl = origUrl;
  if (urlObj.host.toLowerCase() === host.toLowerCase()) {
    urlObj.protocol = 'https';
    urlObj.host = tunnelHost;
    newUrl = url.format(urlObj);
  }
  return newUrl;
};

exports.disconnect = function() {
  ngrok.disconnect();
};
