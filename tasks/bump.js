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
var exec = require('child_process').exec;

module.exports = function(grunt) {
  grunt.registerTask('bump', 'Increment the version number.', function(versionType) {
    var opts = this.options({
      package_file: 'package.json',
      update_config_name: 'pkg',
      commit: true,
      commitMessage: 'Release v${version}',
      commitFiles: ['package.json'], // '-a' for all files
      createTag: true,
      tagName: 'v${version}',
      tagMessage: 'Version ${version}',
      push: true,
      pushTo: 'origin'
    });

    var done = this.async();
    var queue = [];
    var next = function() {
      if (!queue.length) {
        return done();
      }

      queue.shift()();
    };
    var runIf = function(condition, behavior) {
      if (condition) {
        queue.push(behavior);
      }
    };


    var file = grunt.file.read(opts.package_file);
    var version;

    file = file.replace(/([\'|\"]version[\'|\"][ ]*:[ ]*[\'|\"])([\d|.]*)([\'|\"])/i, function(match, left, center, right) {
      version = bumpVersion(center, versionType || 'patch');

      return left + version + right;
    } );

    if (!version) {
      grunt.fatal('Can not find a version to bump');
    }

    grunt.file.write(opts.package_file, file);
    grunt.log.ok('Version bumped to ' + version);
    var cfg = grunt.config(opts.update_config_name);
    if (cfg && cfg.version !== undefined) {
      cfg.version = version;
      grunt.config(opts.update_config_name, cfg);
      grunt.log.ok(opts.update_config_name + '\'s version has now been updated');
    }

    var template = grunt.util._.template;

    // COMMIT
    runIf(opts.commit, function() {
      var commitMessage = template(opts.commitMessage, {version: version});

      exec('git commit ' + opts.commitFiles.join(' ') + ' -m "' + commitMessage + '"', function(err, stdout, stderr) {
        if (err) {
          grunt.fatal('Can not create the commit:\n  ' + stderr);
        }
        grunt.log.ok('Committed as "' + commitMessage + '"');
        next();
      });
    });


    // CREATE TAG
    runIf(opts.createTag, function() {
      var tagName = template(opts.tagName, {version: version});
      var tagMessage = template(opts.tagMessage, {version: version});

      exec('git tag -a ' + tagName + ' -m "' + tagMessage + '"' , function(err, stdout, stderr) {
        if (err) {
          grunt.fatal('Can not create the tag:\n  ' + stderr);
        }
        grunt.log.ok('Tag ' + tagName + ' created');
        next();
      });
    });


    // PUSH CHANGES
    runIf(opts.push, function() {
      exec('git push ' + opts.pushTo + ' --tags', function(err, stdout, stderr) {
        if (err) {
          grunt.fatal('Can not push to ' + opts.pushTo + ':\n  ' + stderr);
        }
        grunt.log.ok('Pushed to ' + opts.pushTo);
        next();
      });
    });

    next();
  });
};

