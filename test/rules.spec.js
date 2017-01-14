var expect = require('chai').expect;
var Rules = require('../src/rules');

var array = [
  {name: 'hello'},
  {name: 'world'},
  {name: 'world: abc'},
  {name: 'other: 1'},
  {name: 'other: 2'},
  {name: 'foo'},
  {name: 'bar'}
];

describe('screener-runner/src/rules', function() {
  describe('Rules.filter', function() {
    it('should filter array by include string rule', function() {
      var includeRules = ['hello'];
      var result = Rules.filter(array, 'name', includeRules);
      expect(result).to.deep.equal([
        {name: 'hello'}
      ]);
    });

    it('should filter array by include regex rule', function() {
      var includeRules = [/^wor/];
      var result = Rules.filter(array, 'name', includeRules);
      expect(result).to.deep.equal([
        {name: 'world'},
        {name: 'world: abc'}
      ]);
    });

    it('should filter array by multiple include rules', function() {
      var includeRules = ['hello', /^wor/];
      var result = Rules.filter(array, 'name', includeRules);
      expect(result).to.deep.equal([
        {name: 'hello'},
        {name: 'world'},
        {name: 'world: abc'}
      ]);
    });

    it('should filter array by exclude string rule', function() {
      var excludeRules = ['hello'];
      var result = Rules.filter(array, 'name', null, excludeRules);
      expect(result).to.deep.equal([
        {name: 'world'},
        {name: 'world: abc'},
        {name: 'other: 1'},
        {name: 'other: 2'},
        {name: 'foo'},
        {name: 'bar'}
      ]);
    });

    it('should filter array by exclude regex rule', function() {
      var excludeRules = [/^wor/];
      var result = Rules.filter(array, 'name', null, excludeRules);
      expect(result).to.deep.equal([
        {name: 'hello'},
        {name: 'other: 1'},
        {name: 'other: 2'},
        {name: 'foo'},
        {name: 'bar'}
      ]);
    });

    it('should filter array by multiple exclude rules', function() {
      var excludeRules = ['hello', /^wor/];
      var result = Rules.filter(array, 'name', [], excludeRules);
      expect(result).to.deep.equal([
        {name: 'other: 1'},
        {name: 'other: 2'},
        {name: 'foo'},
        {name: 'bar'}
      ]);
    });

    it('should filter array by both include and exclude rules', function() {
      var includeRules = ['hello', /^wor/, /^other/];
      var excludeRules = [/^wor/, 'other: 1'];
      var result = Rules.filter(array, 'name', includeRules, excludeRules);
      expect(result).to.deep.equal([
        {name: 'hello'},
        {name: 'other: 2'}
      ]);
    });
  });
});
