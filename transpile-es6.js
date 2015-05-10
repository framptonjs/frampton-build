'use strict';

var map = require('broccoli-stew').map;
var babel = require('babel-core');

module.exports = function(tree, description, options) {

  if (!options) {
    options = {};
  }

  var moduleNames = {};
  var format = options.format || 'amd';

  var outputTree = map(tree, '**/*.js', function(content, relativePath) {

    var moduleName = moduleNames[relativePath];

    if (!moduleName) {
      moduleName = moduleNames[relativePath] = relativePath.slice(0, -3);
    }

    return babel.transform(content, {
      modules: format,
      moduleIds: true,
      moduleId: moduleName,
      filename: relativePath,
      loose: true
    }).code;

  });

  outputTree.description = 'ES6 Modules' + (description ? ': ' + description : '');

  return outputTree;
};