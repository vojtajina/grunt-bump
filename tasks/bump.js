var semver = require('semver')

module.exports = function (grunt) {
    grunt.registerTask('bump', 'Increment the version number.', function (versionType) {
        var done = this.async(),
            cp = require('child_process'),
            PACKAGE_FILE = 'package.json',
            file = grunt.file.read(PACKAGE_FILE),
            version,
            file = file.replace(/([\'|\"]version[\'|\"][ ]*:[ ]*[\'|\"])([\d|.]*)([\'|\"])/i, function (match, left, center, right) {
                version = semver.inc(center, versionType || 'patch')
                return left + version + right
            }),
            gitCommit

        grunt.file.write(PACKAGE_FILE, file)

        // Git commit and tag
        gitCommit = cp.exec('git add package.json && git commit -m "Version bumped up to v' + version + '"', function () {})
        gitCommit.on('exit', function () {
            var gitTag = cp.exec('git tag v' + version, function () {})
            gitTag.on('exit', function () {
                grunt.log.ok('Version bumped to ' + version)
                done()
            })
        })
    })
}
