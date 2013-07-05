module.exports = function(grunt) {

  grunt.initConfig({
    'auto-release': {
      options: {
        checkTravisBuild: false
      }
    }
  });

  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-npm');
  grunt.loadNpmTasks('grunt-auto-release');

  grunt.registerTask('release', 'Bump version, push to NPM.', function(type) {
    grunt.task.run([
      'bump:' + (type || 'patch'),
      'npm-publish'
    ]);
  });
};
