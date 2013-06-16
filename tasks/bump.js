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
    var opts = this.options({
      package_file: 'package.json',
      update_config_name: 'pkg'
    });

    var file = grunt.file.read(opts.package_file);
    var version;

    file = file.replace(/([\'|\"]version[\'|\"][ ]*:[ ]*[\'|\"])([\d|.]*)([\'|\"])/i, function(match, left, center, right) {
      version = bumpVersion(center, versionType || 'patch');

      return left + version + right;
    } );

    if (version === undefined) {
      grunt.log.error("Unable to find version to bump it");
    } else {
      grunt.file.write(opts.package_file, file);
      grunt.log.ok('Version bumped to ' + version);
      var cfg = grunt.config(opts.update_config_name);
      if (cfg && cfg.version !== undefined) {
        cfg.version = version;
        grunt.config(opts.update_config_name, cfg);
        grunt.log.ok(opts.update_config_name + '\'s version has now been updated');
      }
    }
  });
};

