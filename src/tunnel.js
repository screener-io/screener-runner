var ngrok = require('ngrok');
var Promise = require('bluebird');
var url = require('url');

exports.connect = function(host, token) {
  var urlObj = url.parse('http://' + host);
  var options = {
    addr: urlObj.hostname + ':' + (urlObj.port || 80),
    host_header: urlObj.hostname,
    authtoken: token
  };
  var connect = Promise.promisify(ngrok.connect);
  return connect(options)
    .then((tunnelUrl) => {
      console.log(tunnelUrl + ' -> ' + host);
      var urlObj = url.parse(tunnelUrl);
      return urlObj.host;
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
