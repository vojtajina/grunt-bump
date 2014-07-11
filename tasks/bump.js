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
      vcs: 'git'
    });

    if (incOrCommitOnly === 'bump-only') {
      grunt.verbose.writeln('Only incrementing the version.');

      opts.commit = false;
      opts.createTag = false;
      opts.push = false;
    }

    if (incOrCommitOnly === 'commit-only') {
      grunt.verbose.writeln('Only commiting/taggin/pushing.');

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


    // GET VERSION
    runIf(opts.bumpVersion, function(){
      // default to git
      var execCmd = 'git describe ' + opts.gitDescribeOptions;
      var fatalMsg = 'Can not get a version number using `git describe`';

      // check if hg
      if (opts.vcs === 'hg') {
        execCmd = 'hg id -i';
        fatalMsg = 'Can not get a version number using `hg id`';
      }

      exec(execCmd, function(err, stdout, stderr){
        if (err) {
          grunt.fatal(fatalMsg);
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

        grunt.file.write(file, content);
        grunt.log.ok('Version bumped to ' + version + (opts.files.length > 1 ? ' (in ' + file + ')' : ''));

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


    // when only commiting, read the version from package.json / pkg config
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

      // default to git
      var execCmd = 'git commit ' + opts.commitFiles.join(' ') + ' -m "' + commitMessage + '"';
      var fatalMsg = 'Can not create the commit:\n  ';

      // check if hg
      if(opts.vcs === 'hg') {
        execCmd = 'hg commit -m "' + commitMessage + '"' + opts.commitFiles.join(' ');

        // support git tag -a for all files in hg
        if (opts.commitFiles === '-a') {
          opts.commitFiles = '';
        }
      }

      exec(execCmd, function(err, stdout, stderr) {
        if (err) {
          grunt.fatal(fatalMsg + stderr);
        }
        grunt.log.ok('Committed as "' + commitMessage + '"');
        next();
      });
    });


    // CREATE TAG
    runIf(opts.createTag, function() {
      var tagName = opts.tagName.replace('%VERSION%', globalVersion);
      var tagMessage = opts.tagMessage.replace('%VERSION%', globalVersion);

      // default to git
      var execCmd = 'git tag -a ' + tagName + ' -m "' + tagMessage + '"';
      var fatalMsg = 'Can not create the tag:\n  ';

      // check if hg
      if(opts.vcs === 'hg') {
        execCmd = 'hg tag ' + tagName + ' -m "' + tagMessage + '"';
      }

      exec(execCmd, function(err, stdout, stderr) {
        if (err) {
          grunt.fatal(fatalMsg + stderr);
        }
        grunt.log.ok('Tagged as "' + tagName + '"');
        next();
      });
    });


    // PUSH CHANGES
    runIf(opts.push, function() {

      // default to git
      var execCmd = 'git push ' + opts.pushTo + ' && git push ' + opts.pushTo + ' --tags';
      var fatalMsg = 'Can not push to ' + opts.pushTo + ':\n  ';

      // check if hg
      if(opts.vcs === 'hg') {
        execCmd = 'hg push ' + opts.pushTo;
      }

      exec(execCmd, function(err, stdout, stderr) {
        if (err) {
          grunt.fatal(fatalMsg + stderr);
        }
        grunt.log.ok('Pushed to ' + opts.pushTo);
        next();
      });
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
