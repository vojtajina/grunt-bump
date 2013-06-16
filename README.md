[![build status](https://secure.travis-ci.org/vojtajina/grunt-bump.png)](http://travis-ci.org/vojtajina/grunt-bump)
# grunt-bump

**Bump package version.**

## Installation

Install npm package, next to your project's `grunt.js` file:

    npm install grunt-bump

Add this line to your project's `grunt.js`:

    grunt.loadNpmTasks('grunt-bump');


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

## Task configs

```js
bump: {
  package_file: 'package.json',
  update_config_name: 'pkg'
}
```

### Options

#### package_file (Optional)

Default: ```package.json```

Will update this file with the new version number. Probably shouldn't need to be changed.

#### update_config_name (Optional)

Default: ```pkg```

Will update this config with the new version number.
ex: if your Gruntfile.js looks like

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json')
    });

It will update 'pkg' after version is bumped.
