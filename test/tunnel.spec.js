var expect = require('chai').expect;
var rewire = require('rewire');
var sinon = require('sinon');
const mock = require('mock-require');
const ngrokLauncher = require('screener-ngrok');
let Tunnel;

describe('screener-runner/src/tunnel', function() {

  beforeEach(function(){
    Tunnel = rewire('../src/tunnel');
  });

  afterEach(function(){
    sinon.restore();
  });

  describe('Tunnel.connect', function() {


    it('should error when no token', function(done) {

      Tunnel.connect({ ngrok: { host: 'localhost:8080' }})
        .catch(function(err) {
          expect(err.message).to.equal('No Tunnel Token');
          done();
        });

      mock.stopAll();
    });

    it('should establish sauce connect tunnel when pass in sauce credentials', function(done) {

      class SaucelabsMock{
        constructor({user, key}){
          expect(user).to.be.equal('username');
          expect(key).to.be.equal('accessKey');
        }

        startSauceConnect({tunnelName, logfile}){
          expect(tunnelName).to.be.equal('tunnelIdentifier');
          expect(logfile).to.be.equal(`${process.cwd()}/sauce-connect.log`);
          return Promise.resolve();
        }
      }

      mock('saucelabs', {
        default: SaucelabsMock
      });

      Tunnel = mock.reRequire('../src/tunnel');

      Tunnel.connect({ sauce: { username: 'username', accessKey: 'accessKey', tunnelIdentifier: 'tunnelIdentifier' } })
        .then(function(response) {
          expect(response).to.equal(undefined);
          done();
        });
    });

    it('should pass host/token and return tunnel url on success', function(done) {

      sinon.stub(ngrokLauncher, 'connect').callsFake(function(options, cb) {
        expect(options).to.deep.equal({
          addr: 'localhost:8080',
          host_header: 'localhost:8080',
          authtoken: 'token',
          bind_tls: true
        });
        cb(null, 'https://tunnel-url');
      });


      Tunnel.connect({ ngrok: { host: 'localhost:8080', token: 'token' }})
        .then(function(tunnelUrl) {
          expect(tunnelUrl).to.equal('tunnel-url');
          done();
        });
    });

    it('should default to port 80 if port not set', function(done) {

      sinon.stub(ngrokLauncher, 'connect').callsFake(function(options, cb) {
        expect(options).to.deep.equal({
          addr: 'localhost:80',
          host_header: 'localhost',
          authtoken: 'token',
          bind_tls: true
        });
        cb(null, 'https://tunnel-url');
      });

      Tunnel.connect({ ngrok: { host: 'localhost', token: 'token' }})
        .then(function(tunnelUrl) {
          expect(tunnelUrl).to.equal('tunnel-url');
          done();
        });
    });

    it('should support host with http protocol', function(done) {

      sinon.stub(ngrokLauncher, 'connect').callsFake(function(options, cb) {
        expect(options).to.deep.equal({
          addr: 'localhost:3000',
          host_header: 'localhost:3000',
          authtoken: 'token',
          bind_tls: true
        });
        cb(null, 'https://tunnel-url');
      });

      Tunnel.connect({ ngrok: { host: 'http://localhost:3000/path', token: 'token' }})
        .then(function(tunnelUrl) {
          expect(tunnelUrl).to.equal('tunnel-url');
          done();
        });
    });

    it('should support host with https protocol', function(done) {

      sinon.stub(ngrokLauncher, 'connect').callsFake(function(options, cb) {
        expect(options).to.deep.equal({
          addr: 'https://domain.com',
          host_header: 'rewrite',
          authtoken: 'token',
          bind_tls: true
        });
        cb(null, 'https://tunnel-url');
      });

      Tunnel.connect({ ngrok: { host: 'https://domain.com/', token: 'token' }})
        .then(function(tunnelUrl) {
          expect(tunnelUrl).to.equal('tunnel-url');
          done();
        });
    });

    it('should support host with https protocol and custom port', function(done) {

      sinon.stub(ngrokLauncher, 'connect').callsFake(function(options, cb){
        expect(options).to.deep.equal({
          addr: 'https://domain.com:4430',
          host_header: 'rewrite',
          authtoken: 'token',
          bind_tls: true
        });
        cb(null, 'https://tunnel-url');
      });

      Tunnel.connect({ ngrok: { host: 'https://domain.com:4430', token: 'token' }})
        .then(function(tunnelUrl) {
          expect(tunnelUrl).to.equal('tunnel-url');
          done();
        });
    });

    it('should return error on failure', function(done) {

      this.timeout(35000);

      sinon.stub(ngrokLauncher, 'connect').callsFake(function(options, cb){
        cb(new Error('error msg'));
      });
      Tunnel.connect({ ngrok: { host: 'localhost:8080', token: 'token' }})
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

      Tunnel.__set__('sauceConnection', undefined);

      const disconnectStub = sinon.stub(ngrokLauncher, 'disconnect');

      Tunnel.disconnect();
      expect(disconnectStub.called).to.equal(true);
    });

    it('should call sauceConnection.close()', function() {
      var sauceConnection = {
        close: sinon.spy()
      };
      Tunnel.__set__('sauceConnection', sauceConnection);
      Tunnel.disconnect();
      expect(sauceConnection.close.called).to.equal(true);
    });
  });
});
