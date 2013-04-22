/*
 * grunt-yaml-frontmatter-to-json
 * https://github.com/davidkwoods/yaml-frontmatter-to-json
 *
 * Copyright (c) 2013 David Woods
 * Licensed under the MIT license.
 */

'use strict';



var moment = require('moment'),
    path = require('path'),
    yaml = require('yaml-front-matter'),
    marked = require('marked');

// Side effects:
// - if .date is detected, a formated date is added as .iso8601date

function processFile(filename)
{    
    var _basename = path.basename(filename, path.extname(filename));
    var _metadata = yaml.loadFront(filename);

    if (_metadata)
    {
        // map user-entered date to a better one using moment's great parser
        if (_metadata.date) 
            _metadata.iso8601Date = moment(_metadata.date).format();
        if (_metadata.__content)
            _metadata.__content = marked.parse(_metadata.__content);
    }

    return { 
        metadata: _metadata,
        basename: _basename 
    }
}

function parseFile(filename)
{
  var m = processFile(filename);

  return JSON.stringify(m.metadata, null, 2);
}


module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('yfm2js', 'Your task description goes here.', function() {
    grunt.log.writeln('entered yfm2js');
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      punctuation: '.',
      separator: ', '
    });

    grunt.log.writeln('About to iterate through files');
    var i = 0;
    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      // Concat specified files.
      grunt.log.writeln('File ' + i + ' : ' + f);
      i++;
      for (var prop in f) {
        grunt.log.writeln(prop);
      }
      var articles = [];
      var src = f.src.filter(function(filepath) {
      grunt.log.writeln('Filtering paths');
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
      grunt.log.writeln('Parsing file');
        // Read file source.
        var file = parseFile(filepath);
        articles.push(file);
        return file;
      });
      grunt.log.writeln('files parsed');

      // Write the destination file.
      articles.forEach(function(json) {
        grunt.file.write(f.dest, json);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
      });
    });
  });

};
