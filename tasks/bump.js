/*
 * Increase version number
 *
 * grunt bump
 * grunt bump:patch
 * grunt bump:minor
 * grunt bump:major
 *
 * @author Vojta Jina <vojta.jina@gmail.com>
 */
var bumpVersion = require("./bump/index.js");

module.exports = function(grunt) {
  grunt.registerTask('bump', 'Increment the version number.', function(versionType) {
    var PACKAGE_FILE = 'package.json';
    var package = grunt.file.readJSON(PACKAGE_FILE);

    // compute the new version
    package.version = bumpVersion(package.version, versionType || 'patch');

    grunt.file.write(PACKAGE_FILE, JSON.stringify(package, null, '  '));
    grunt.log.ok('Version bumped to ' + package.version);
  });
};
