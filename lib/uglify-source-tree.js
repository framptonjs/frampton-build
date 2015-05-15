'use strict';

var uglify = require('broccoli-uglify-js');
var Funnel = require('broccoli-funnel');

module.exports = function uglifySourceTree(tree, options) {

  var uglifyTree = new Funnel(tree, {
    files: [options.srcFile],
    getDestinationPath: function(relativePath) {
      if (relativePath === options.srcFile) {
        return options.destFile;
      } else {
        return relativePath;
      }
    }
  });

  return uglify(uglifyTree, {
    mangle   : options.mangle,
    compress : options.compress
  });
};