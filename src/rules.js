var cloneDeep = require('lodash/cloneDeep');

var checkRule = function(value, rule) {
  if (rule instanceof RegExp) {
    return rule.test(value);
  }
  return rule === value;
};

var filterBy = function(array, prop, rules, toRemove) {
  if (rules instanceof Array && rules.length > 0) {
    return array.filter(function(item) {
      var value = item[prop];
      var isFound = rules.some(function(rule) {
        return checkRule(value, rule);
      });
      if (toRemove) {
        return !isFound;
      } else {
        return isFound;
      }
    });
  }
  return array;
};

exports.filter = function(array, prop, includeRules, excludeRules) {
  var filtered = cloneDeep(array);
  // apply includeRules
  filtered = filterBy(filtered, prop, includeRules);
  // apply excludeRules
  filtered = filterBy(filtered, prop, excludeRules, true);
  return filtered;
};
