/*
 * Increase version number
 *
 * grunt bump
 * grunt bump:git
 * grunt bump:patch
 * grunt bump:minor
 * grunt bump:major
 *
 * @author Vojta Jina <vojta.jina@gmail.com>
 * @author Mathias Paumgarten <mail@mathias-paumgarten.com>
 * @author Adam Biggs <email@adambig.gs>
 */

'use strict';

var semver = require('semver');
var exec = require('child_process').exec;

module.exports = function(grunt) {

  var DESC = 'Increment the version, commit, tag and push.';
  grunt.registerTask('bump', DESC, function(versionType, incOrCommitOnly) {
    var opts = this.options({
      bumpVersion: true,
      files: ['package.json'],
      updateConfigs: [], // array of config properties to update (with files)
      commit: true,
      commitMessage: 'Release v%VERSION%',
      commitFiles: ['package.json'], // '-a' for all files
      createTag: true,
      tagName: 'v%VERSION%',
      tagMessage: 'Version %VERSION%',
      push: true,
      pushTo: 'upstream',
      gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
      globalReplace: false
    });

    var DRY = grunt.option('dry-run');
    if (DRY) {
      grunt.log.writeln('Running grunt-bump in dry mode!');
    }

    if (incOrCommitOnly === 'bump-only') {
      grunt.verbose.writeln('Only incrementing the version.');

      opts.commit = false;
      opts.createTag = false;
      opts.push = false;
    }

    if (incOrCommitOnly === 'commit-only') {
      grunt.verbose.writeln('Only committing/tagging/pushing.');

      opts.bumpVersion = false;
    }

    var exactVersionToSet = grunt.option('setversion');
    if (!semver.valid(exactVersionToSet)) {
      exactVersionToSet = false;
    }

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

    var globalVersion; // when bumping multiple files
    var gitVersion;    // when bumping using `git describe`
    var VERSION_REGEXP = /([\'|\"]?version[\'|\"]?[ ]*:[ ]*[\'|\"]?)([\d||A-a|.|-]*)([\'|\"]?)/i;


    if (opts.globalReplace) {
      // Redefine the regular expression with the _g_lobal flag in addition to the _i_gnore flag.
      VERSION_REGEXP = new RegExp(VERSION_REGEXP.source, 'gi');
    }


    // GET VERSION FROM GIT
    runIf(opts.bumpVersion && versionType === 'git', function(){
      exec('git describe ' + opts.gitDescribeOptions, function(err, stdout, stderr){
        if (err) {
          grunt.fatal('Can not get a version number using `git describe`');
        }
        gitVersion = stdout.trim();
        next();
      });
    });


    // BUMP ALL FILES
    runIf(opts.bumpVersion, function(){
      grunt.file.expand(opts.files).forEach(function(file, idx) {
        var version = null;
        var content = grunt.file.read(file).replace(VERSION_REGEXP, function(match, prefix, parsedVersion, suffix) {
          gitVersion = gitVersion && parsedVersion + '-' + gitVersion;
          version = exactVersionToSet || gitVersion || semver.inc(parsedVersion, versionType || 'patch');
          return prefix + version + suffix;
        });

        if (!version) {
          grunt.fatal('Can not find a version to bump in ' + file);
        }

        var logMsg = 'Version bumped to ' + version +  ' (in ' + file + ')';
        if (!DRY){
          grunt.file.write(file, content);
          grunt.log.ok(logMsg);
        } else {
          grunt.log.ok('bump-dry: ' + logMsg);
        }

        if (!globalVersion) {
          globalVersion = version;
        } else if (globalVersion !== version) {
          grunt.warn('Bumping multiple files with different versions!');
        }

        var configProperty = opts.updateConfigs[idx];
        if (!configProperty) {
          return;
        }

        var cfg = grunt.config(configProperty);
        if (!cfg) {
          return grunt.warn('Can not update "' + configProperty + '" config, it does not exist!');
        }

        cfg.version = version;
        grunt.config(configProperty, cfg);
        grunt.log.ok(configProperty + '\'s version updated');
      });
      next();
    });


    // when only committing, read the version from package.json / pkg config
    runIf(!opts.bumpVersion, function() {
      if (opts.updateConfigs.length) {
        globalVersion = grunt.config(opts.updateConfigs[0]).version;
      } else {
        globalVersion = grunt.file.readJSON(opts.files[0]).version;
      }

      next();
    });


    // COMMIT
    runIf(opts.commit, function() {
      var commitMessage = opts.commitMessage.replace('%VERSION%', globalVersion);
      var cmd = 'git commit ' + opts.commitFiles.join(' ') + ' -m "' + commitMessage + '"';

      if(DRY){
        // since nothing has actually changed, running git commit with --dry-run
        // will fail, so we just print the command instead
        grunt.log.ok('bump-dry: ' + cmd);
        next();
      } else {
        exec(cmd, function(err, stdout, stderr) {
          if (err) {
            grunt.fatal('Can not create the commit:\n  ' + stderr);
          }
          grunt.log.ok('Committed as "' + commitMessage + '"');
          next();
        });
      }
    });


    // CREATE TAG
    runIf(opts.createTag, function() {
      var tagName = opts.tagName.replace('%VERSION%', globalVersion);
      var tagMessage = opts.tagMessage.replace('%VERSION%', globalVersion);

      var cmd = 'git tag -a ' + tagName + ' -m "' + tagMessage + '"';
      if (DRY) {
        // cannot run git tag in dry mode so we just give the command as output.
        grunt.log.ok('bump-dry: ' + cmd);
        next();
      } else {
        exec(cmd , function(err, stdout, stderr) {
          if (err) {
            grunt.fatal('Can not create the tag:\n  ' + stderr);
          }
          grunt.log.ok('Tagged as "' + tagName + '"');
          next();
        });
      }
    });


    // PUSH CHANGES
    runIf(opts.push, function() {
      var cmd = 'git push ' + opts.pushTo + ' && git push ' + opts.pushTo + ' --tags';
      if (DRY){
        // since nothing has actually been comitted, running git push with --dry-run
        // will fail, so we just print the command instead
        grunt.log.ok('bump-dry: ' + cmd);
        next();
      } else {
        exec(cmd, function(err, stdout, stderr) {
          if (err) {
            grunt.fatal('Can not push to ' + opts.pushTo + ':\n  ' + stderr);
          }
          grunt.log.ok('Pushed to ' + opts.pushTo);
          next();
        });
      }
    });

    next();
  });


  // ALIASES
  DESC = 'Increment the version only.';
  grunt.registerTask('bump-only', DESC, function(versionType) {
    grunt.task.run('bump:' + (versionType || '') + ':bump-only');
  });

  DESC = 'Commit, tag, push without incrementing the version.';
  grunt.registerTask('bump-commit', DESC, 'bump::commit-only');
};
