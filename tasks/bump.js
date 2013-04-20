/*
 * Increase version number
 *
 * grunt bump
 * grunt bump:patch
 * grunt bump:minor
 * grunt bump:major
 * grunt bump:build
 *
 * @author Vojta Jina <vojta.jina@gmail.com>
 * @author Mathias Paumgarten <mail@mathias-paumgarten.com>
 */
var semver = require("semver");

module.exports = function(grunt) {
  grunt.registerTask('bump', 'Increment the version number.', function(versionType) {
    var done = this.async();
    var cp = require('child_process');
    var PACKAGE_FILE = 'package.json';
    var file = grunt.file.read(PACKAGE_FILE);
    var version;

    var file = file.replace(/([\'|\"]version[\'|\"][ ]*:[ ]*[\'|\"])([\d|.]*)([\'|\"])/i, function(match, left, center, right) {
      version = semver.inc(center, versionType || 'patch');

      return left + version + right;
    } );

    grunt.file.write(PACKAGE_FILE, file);

    // Git commit and tag
    var gitCommit = cp.exec('git add package.json && git commit -m "Version bumped up to v' + version + '"', function() {});
    gitCommit.on('exit', function() {
      var gitTag = cp.exec('git tag v' + version, function() {});
      gitTag.on('exit', function() {
        grunt.log.ok('Version bumped to ' + version);
        done();
      });
    });
  });
};

