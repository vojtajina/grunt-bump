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
var bumpVersion = require("./bump/index.js");

module.exports = function(grunt) {
  grunt.registerTask('bump', 'Increment the version number.', function(versionType) {
    var PACKAGE_FILE = 'package.json';
    var file = grunt.file.read(PACKAGE_FILE);
    var version;

    var file = file.replace(/([\'|\"]version[\'|\"][ ]*:[ ]*[\'|\"])([\d|.]*)([\'|\"])/i, function(match, left, center, right) {
      version = bumpVersion(center, versionType || 'patch');

      return left + version + right;
    } );

    grunt.file.write(PACKAGE_FILE, file);
    grunt.log.ok('Version bumped to ' + version);
  });
};

