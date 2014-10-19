module.exports = (grunt) ->
  grunt.initConfig
    bump:
      options:
        files: ['testPackage.json']

  grunt.loadTasks '../../tasks'

  grunt.registerTask 'default', []