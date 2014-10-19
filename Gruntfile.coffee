module.exports = (grunt) ->
  # load all npm grunt tasks
  require('load-grunt-tasks') grunt

  grunt.initConfig
    jshint:
      options: node: true
      task: ['tasks/*.js']
      test: ['<%= nodeunit.tests %>']

    clean: tests: ['tmp']
    nodeunit: tests: ['test/test_*.js']

    mochaTest:
      test:
        options:
          reporter: 'spec',
        src: ['test/**/*.js']


    'auto-release': options: checkTravisBuild: false
    'npm-contributors': options: commitMessage: 'chore: update contributors'

  # Actually load this plugin's task. Mainly for testing
  grunt.loadTasks('tasks')

  grunt.registerTask 'test', ['clean', 'mochaTest']

  grunt.registerTask 'default', ['jshint:task']

  grunt.registerTask 'release', 'Build, bump and publish to NPM.', (type) ->
    grunt.task.run [
      'npm-contributors'
      "bump:#{type||'patch'}"
      'npm-publish'
    ]
