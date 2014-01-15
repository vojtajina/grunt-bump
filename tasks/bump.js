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
var semver = require('semver');
var exec = require('child_process').exec;

module.exports = function(grunt) {

  var DESC = 'Increment the version, commit, tag and push.';
  grunt.registerTask('bump', DESC, function(versionType, incOrCommitOnly) {
    var opts = this.options({
      bumpVersion: true,
      files: ['package.json'],
      bumpReadme: false,
      readmeFile: 'README.md',
      readmeText: 'Version:',
      updateConfigs: [], // array of config properties to update (with files)
      commit: true,
      commitMessage: 'Release v%VERSION%',
      commitFiles: ['package.json'], // '-a' for all files
      createTag: true,
      tagName: 'v%VERSION%',
      tagMessage: 'Version %VERSION%',
      push: true,
      pushTo: 'upstream',
      gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
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
      opts.files.forEach(function(file, idx) {
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

    // bump README.md,
    runIf(opts.bumpReadme, function() {
      /* 
       * regex to match markdown format in the example: 
       * Version: **[0.2.2](https://github.com/user/foobar/releases/tag/v0.2.2)**
       *
       * Match groups for replace function are:
       *
       * leadText == 'Version: **['
       * version  == '0.2.2'
       * urlUpToTag == 'https://github.com/user/foobar/releases/tag/v'
       * versionUrl == '0.2.2'
       * endText == ')**'
       *
       */
      var readmeRegExp = new RegExp("(^" + opts.readmeText + ".*\\[)([\\d|.|-|a-z]+)(\\].*\\/v?)([\\d|.|-|a-z]+)(\\).*)", "img");
      var replaced = false;
      var content = grunt.file.read(opts.readmeFile).replace(readmeRegExp, function(match, leadText, version, urlUpToTag, versionUrl, endText,  offset, string) {
        replaced = true;
        return  leadText + globalVersion + urlUpToTag + globalVersion + endText; 
      });

      if (replaced === false) {
        grunt.fatal('Can not find text to bump in ' + opts.readmeFile);
      } else if (globalVersion.length === 0) {
        grunt.fatal('Can not find a version to bump');
      } else {
        grunt.file.write(opts.readmeFile, content);
        grunt.log.ok(opts.readmeFile + ' version bumped to ' + globalVersion);
      }
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
      var tagName = opts.tagName.replace('%VERSION%', globalVersion);
      var tagMessage = opts.tagMessage.replace('%VERSION%', globalVersion);

      exec('git tag -a ' + tagName + ' -m "' + tagMessage + '"' , function(err, stdout, stderr) {
        if (err) {
          grunt.fatal('Can not create the tag:\n  ' + stderr);
        }
        grunt.log.ok('Tagged as "' + tagName + '"');
        next();
      });
    });


    // PUSH CHANGES
    runIf(opts.push, function() {
      exec('git push ' + opts.pushTo + ' && git push ' + opts.pushTo + ' --tags', function(err, stdout, stderr) {
        if (err) {
          grunt.fatal('Can not push to ' + opts.pushTo + ':\n  ' + stderr);
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

