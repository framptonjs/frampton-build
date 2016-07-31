const map = require('broccoli-stew').map;
const babel = require('babel-core');
const es2015 = require('babel-preset-es2015');
const amdModules = require('babel-plugin-transform-es2015-modules-amd');

module.exports = function(tree, description, options) {

  if (!options) {
    options = {};
  }

  const moduleNames = {};
  const format = options.format || 'amd';

  const outputTree = map(tree, '**/*.js', function(content, relativePath) {

    var moduleName = moduleNames[relativePath];

    if (!moduleName) {
      moduleName = moduleNames[relativePath] = relativePath.slice(0, -3);
    }

    return babel.transform(content, {
      moduleIds : true,
      moduleId : moduleName,
      filename : relativePath,
      presets : [
        es2015
      ],
      plugins : [
        amdModules
      ]
    }).code;

  });

  outputTree.description = 'ES6 Modules' + (description ? ': ' + description : '');

  return outputTree;
};
