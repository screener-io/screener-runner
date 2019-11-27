var expect = require('chai').expect;
var rewire = require('rewire');
var sinon = require('sinon');
var Tunnel = rewire('../src/tunnel');

describe('screener-runner/src/tunnel', function() {
  this.timeout(5000);

  describe('Tunnel.connect', function() {
    it('should error when no token', function(done) {
      Tunnel.connect('localhost:8080')
        .catch(function(err) {
          expect(err.message).to.equal('No Tunnel Token');
          done();
        });
    });

    it('should pass host/token and return tunnel url on success', function(done) {
      Tunnel.__set__('ngrok', {
        connect: function(options, cb) {
          expect(options).to.deep.equal({
            addr: 'localhost:8080',
            host_header: 'localhost:8080',
            authtoken: 'token',
            bind_tls: true
          });
          cb(null, 'https://tunnel-url');
        }
      });
      Tunnel.connect('localhost:8080', 'token')
        .then(function(tunnelUrl) {
          expect(tunnelUrl).to.equal('tunnel-url');
          done();
        });
    });

    it('should default to port 80 if port not set', function(done) {
      Tunnel.__set__('ngrok', {
        connect: function(options, cb) {
          expect(options).to.deep.equal({
            addr: 'localhost:80',
            host_header: 'localhost',
            authtoken: 'token',
            bind_tls: true
          });
          cb(null, 'https://tunnel-url');
        }
      });
      Tunnel.connect('localhost', 'token')
        .then(function(tunnelUrl) {
          expect(tunnelUrl).to.equal('tunnel-url');
          done();
        });
    });

    it('should support host with http protocol', function(done) {
      Tunnel.__set__('ngrok', {
        connect: function(options, cb) {
          expect(options).to.deep.equal({
            addr: 'localhost:3000',
            host_header: 'localhost:3000',
            authtoken: 'token',
            bind_tls: true
          });
          cb(null, 'https://tunnel-url');
        }
      });
      Tunnel.connect('http://localhost:3000/path', 'token')
        .then(function(tunnelUrl) {
          expect(tunnelUrl).to.equal('tunnel-url');
          done();
        });
    });

    it('should support host with https protocol', function(done) {
      Tunnel.__set__('ngrok', {
        connect: function(options, cb) {
          expect(options).to.deep.equal({
            addr: 'https://domain.com',
            host_header: 'rewrite',
            authtoken: 'token',
            bind_tls: true
          });
          cb(null, 'https://tunnel-url');
        }
      });
      Tunnel.connect('https://domain.com/', 'token')
        .then(function(tunnelUrl) {
          expect(tunnelUrl).to.equal('tunnel-url');
          done();
        });
    });

    it('should support host with https protocol and custom port', function(done) {
      Tunnel.__set__('ngrok', {
        connect: function(options, cb) {
          expect(options).to.deep.equal({
            addr: 'https://domain.com:4430',
            host_header: 'rewrite',
            authtoken: 'token',
            bind_tls: true
          });
          cb(null, 'https://tunnel-url');
        }
      });
      Tunnel.connect('https://domain.com:4430', 'token')
        .then(function(tunnelUrl) {
          expect(tunnelUrl).to.equal('tunnel-url');
          done();
        });
    });

    it('should return error on failure', function(done) {
      Tunnel.__set__('ngrok', {
        connect: function(options, cb) {
          cb(new Error('error msg'));
        }
      });
      Tunnel.connect('localhost:8080', 'token')
        .catch(function(err) {
          expect(err.message).to.equal('error msg');
          done();
        });
    });
  });

  describe('Tunnel.transformUrl', function() {
    it('should return new url using tunnelHost when host matches', function() {
      var newUrl = Tunnel.transformUrl('http://localhost:8080/path', 'localhost:8080', 'tunnel-url');
      expect(newUrl).to.equal('https://tunnel-url/path');
    });

    it('should return new url using tunnelHost when http host matches', function() {
      var newUrl = Tunnel.transformUrl('http://localhost:8080/path', 'http://localhost:8080', 'tunnel-url');
      expect(newUrl).to.equal('https://tunnel-url/path');
    });

    it('should return new url using tunnelHost when https host matches', function() {
      var newUrl = Tunnel.transformUrl('https://localhost/path', 'https://localhost', 'tunnel-url');
      expect(newUrl).to.equal('https://tunnel-url/path');
    });

    it('should return original url when host does not match', function() {
      var newUrl = Tunnel.transformUrl('http://domain.com/path', 'localhost:8080', 'tunnel-url');
      expect(newUrl).to.equal('http://domain.com/path');
    });
  });

  describe('Tunnel.disconnect', function() {
    it('should call ngrok.disconnect()', function() {
      var ngrokMock = {
        disconnect: sinon.spy()
      };
      Tunnel.__set__('ngrok', ngrokMock);
      Tunnel.disconnect();
      expect(ngrokMock.disconnect.called).to.equal(true);
    });
  });
});
