var grunt = require('grunt');

require('../tasks/bump')(grunt);

exports['bump_version'] = function(test) {
  test.expect(3);
  test.equal(grunt.helper('bump_version', '0.0.1', 'patch'), '0.0.2');
  test.equal(grunt.helper('bump_version', '1.0.1', 'minor'), '1.1.0');
  test.equal(grunt.helper('bump_version', '1.5.1', 'major'), '2.0.0');
  test.done();
};
