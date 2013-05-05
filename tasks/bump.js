/*
 * Increase version number
 *
 * grunt bump
 * grunt bump:patch   1.1.1 -> 1.1.2
 * grunt bump:minor   1.1.1 -> 1.2.0
 * grunt bump:major   1.1.1 -> 2.0.0
 * grunt bump:pre     2.0.0-rc3.1+build.1 -> 2.0.0-rc3.2
 * grunt bump:build   2.0.0-rc3.1+build.1 -> 2.0.0-rc3.1+build.2
 * grunt bump:release 2.0.0-rc3.1+build.1 -> 2.0.0
 *
 * @author Vojta Jina <vojta.jina@gmail.com>
 * @author Mathias Paumgarten <mail@mathias-paumgarten.com>
 */
var bumpVersion = require("./bump/index.js");

module.exports = function(grunt) {
  grunt.registerTask('bump', 'Increment the version number.', function(versionType) {
    var PACKAGE_FILE = 'package.json';
    var file = grunt.file.read(PACKAGE_FILE);
    var version;

    var file = file.replace(/([\'|\"]version[\'|\"][ ]*:[ ]*[\'|\"])([^\'\"]*)([\'|\"])/i, function(match, left, center, right) {
      version = bumpVersion(center, versionType || 'patch');

      return left + version + right;
    } );

    grunt.file.write(PACKAGE_FILE, file);
    grunt.log.ok('Version bumped to ' + version);
  });
};

