/*
 * Increase version number
 *
 * grunt bump
 * grunt bump:patch
 * grunt bump:minor
 * grunt bump:major
 *
 * @author Vojta Jina <vojta.jina@gmail.com>
 * @author Mathias Paumgarten <mail@mathias-paumgarten.com>
 */

module.exports = function(grunt) {
  grunt.registerTask('bump', 'Increment the version number.', function(versionType) {
    var PACKAGE_FILE = 'package.json';
    var package = grunt.file.readJSON(PACKAGE_FILE);
    var file = grunt.file.read( PACKAGE_FILE );

    // compute the new version
    var version = grunt.helper('bump_version', package.version, versionType || 'patch');

    var file = file.replace( /([\'|\"]version[\'|\"]:[ ]*[\'|\"])([\d|.]*)([\'|\"])/i, function( match, right, center, left ) {
      return right + version + left;
    } );

    grunt.file.write( PACKAGE_FILE, file );

    grunt.log.ok('Version bumped to ' + version);
  });


  grunt.registerHelper('bump_version', function(version, versionType) {
    var type = {
      patch: 2,
      minor: 1,
      major: 0
    };

    var parts = version.split('.');
    var idx = type[versionType || 'patch'];

    parts[idx] = parseInt(parts[idx], 10) + 1;
    while(++idx < parts.length) {
      parts[idx] = 0;
    }
    return parts.join('.');
  });
};
