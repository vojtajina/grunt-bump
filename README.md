[![build status](https://secure.travis-ci.org/vojtajina/grunt-bump.png)](http://travis-ci.org/vojtajina/grunt-bump)
# grunt-bump

**Bump package version.**

## Installation

Install npm package, next to your project's `grunt.js` file:

    npm install grunt-bump

Add this line to your project's `grunt.js`:

    grunt.loadNpmTasks('grunt-bump');


## Configuration

By default, bump will bump your `package.json` file. If you would like to bump a different file, or multiple files at the same time, you may configure bump to do so:

```javascript
module.exports = function (grunt) {
   grunt.initConfig({
      bump: {
          options: {
              files: [
                  'package.json',
                  'bower.json'
              ]
          }
      }
   });
}
```

## Usage

Let's say current version is `0.0.1`.

````
grunt bump
>> Version bumped to 0.0.2

grunt bump:patch
>> Version bumped to 0.0.3

grunt bump:minor
>> Version bumped to 0.1.0

grunt bump
>> Version bumped to 0.1.1

grunt bump:major
>> Version bumped to 1.0.0
````
