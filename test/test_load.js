'use strict';

var _ = require('lodash');
var chai = require('chai');
var expect = chai.expect;

var grunt = require('grunt');
var bump = require('../tasks/bump');

var testFile = 'test/data/testPackage.json';
var cleanFile = function(){ grunt.file.write(testFile, JSON.stringify({version:'0.0.0'}));};

describe('registration', function() {
    var server;
    var gruntMock = require('./mocks/grunt');

    before(function() {
        bump(gruntMock);
    });

    after(function() {

    });

    it('should be a function', function() {
        var expected = 'function';
        expect(typeof bump).to.equal(expected);
    });

    it('should register three bump tasks', function(){
        expect(gruntMock.tasks.length).to.equal(3);
        var taskNames = _.flatten(gruntMock.tasks, 'name');
        expect(taskNames.indexOf('bump')).not.to.equal(-1);
        expect(taskNames.indexOf('bump-only')).not.to.equal(-1);
        expect(taskNames.indexOf('bump-commit')).not.to.equal(-1);
    });

});

describe('tasks', function(){
    before(cleanFile);
    after(cleanFile);

    it('should make a patch version',function(done){
        grunt.util.spawn({ grunt: true, args: ['bump-only:patch', '--gruntfile=test/data/Gruntfile.coffee']}, function(error, result, code) {
            var testPkg = grunt.file.readJSON(testFile);
            expect(testPkg.version).to.equal('0.0.1');
            done();
        });
    });

    it('should make a minor version',function(done){
        grunt.util.spawn({ grunt: true, args: ['bump-only:minor', '--gruntfile=test/data/Gruntfile.coffee']}, function(error, result, code) {
            var testPkg = grunt.file.readJSON(testFile);
            expect(testPkg.version).to.equal('0.1.0');
            done();
        });
    });

    it('should make a major version',function(done){
        grunt.util.spawn({ grunt: true, args: ['bump-only:major', '--gruntfile=test/data/Gruntfile.coffee']}, function(error, result, code) {
            var testPkg = grunt.file.readJSON(testFile);
            expect(testPkg.version).to.equal('1.0.0');
            done();
        });
    });
});

describe('git versioning',function(){
    /**
     * Because of the nature of working with git, we are testing against
     * against the real repo's git information
     */

    var versionRegex;

    before(cleanFile);
    before(function(){
        var pkg = grunt.file.readJSON('package.json');
        var currentVersion = pkg.version;
        var gitVersionRegExp = '^v' + currentVersion.replace(/\./g, '\\.') + '-[0-9]{1}-g[0-9a-f]{4,5}-d$';
        versionRegex = new RegExp( gitVersionRegExp, 'i');
    });
    after(cleanFile);

    it('should make a git version', function(done){
        grunt.util.spawn({ grunt: true, args: ['bump-only:git', '--gruntfile=test/data/Gruntfile.coffee']}, function() {
            var testPkg = grunt.file.readJSON(testFile);
            var setVersion = testPkg.version;
            expect(versionRegex.test(setVersion)).to.equal(true);
            //Now test a second time and make sure the version is identical
            grunt.util.spawn({ grunt: true, args: ['bump-only:git', '--gruntfile=test/data/Gruntfile.coffee']}, function() {
                var testPkgAgain = grunt.file.readJSON(testFile);
                expect(versionRegex.test(testPkgAgain.version)).to.equal(true);
                expect(setVersion).to.equal(testPkgAgain.version);
                done();
            });
        });
    });

});