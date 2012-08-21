module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    test: {
      bump: ['test/*.spec.js']
    },
  });

  // Load local tasks.
  grunt.loadTasks('tasks');

  // Default task.
  grunt.registerTask('default', 'test');
};
