var concat = require('broccoli-concat');
var mergeTrees = require('broccoli-merge-trees');
var merge        = require('lodash-node/modern/object/merge');
var transpileES6 = require('./transpile-es6');
var writeFile    = require('broccoli-file-creator');

var iifeStart = writeFile('iife-start', '(function() {');
var iifeStop  = writeFile('iife-stop', '})();');

var defaultOptions = {
  inputFiles: ['**/*.js']
};

function isArray(arr) {
  return Object.prototype.toString.call(arr) === "[object Array]";
}

/*
  Responsible for concatenating ES6 modules together wrapped in loader and iife
  (immediately-invoked function expression)
*/
module.exports = function concatenateES6Modules(inputTrees, options) {

  var mergedOptions = merge({}, defaultOptions, options || {});
  var loader        = 'packages/loader/src';
  var inputFiles    = mergedOptions.inputFiles;
  var destFile      = mergedOptions.destFile;

  var sourceTrees;

  // if given an array of trees merge into single tree
  if (isArray(inputTrees)) {
    sourceTrees = mergeTrees(inputTrees, {overwrite: true});
  } else {
    sourceTrees = inputTrees;
  }

  sourceTrees = transpileES6(sourceTrees);

  var concatTrees = [loader, iifeStart, iifeStop, sourceTrees];
  if (mergedOptions.includeLoader) {
    inputFiles.unshift('loader.js');
  }

  if (mergedOptions.bootstrapModule) {
    mergedOptions.bootstrapModules = [mergedOptions.bootstrapModule];
  }

  if (mergedOptions.bootstrapModules) {
    var contents = mergedOptions.bootstrapModules.map(function(module) {
      return 'requireModule("' + module + '");';
    })
    .join('\n');

    var bootstrapTree = writeFile('bootstrap', contents + '\n');
    concatTrees.push(bootstrapTree);
    inputFiles.push('bootstrap');
  }

  // do not modify inputFiles after here (otherwise IIFE will be messed up)
  if (!mergedOptions.wrapInIIFE) {
    inputFiles.unshift('iife-start');
    inputFiles.push('iife-stop');
  }

  var concattedES6 = concat(mergeTrees(concatTrees), {
    sourceMapConfig: { enabled: !!options.enableSourceMaps },
    inputFiles: inputFiles,
    outputFile: destFile,
    allowNone: true,
    description: 'Concat ES6: ' + destFile
  });

  if (mergedOptions.derequire && !disableDerequire) {
    concattedES6 = derequire(concattedES6);
  }

  return concattedES6;
};