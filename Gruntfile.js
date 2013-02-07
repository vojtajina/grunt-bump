module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    nodeunit: {
      bump: ['test/*.spec.js']
    }
  });

  // Load local tasks.
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Load local tasks.
  grunt.loadTasks('tasks');

  // Default task.
  grunt.registerTask('default', 'nodeunit');
  grunt.registerTask('test', 'nodeunit');
};
