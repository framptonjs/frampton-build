'use strict';

// to avoid circular dependency shenanigans
module.exports = getPackage;

var Funnel     = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');
var jshintTree = require('broccoli-jshint');

var disableJSHint = true;

function getPackage(packages, packageName, opts) {

  var pkg        = packages[packageName];
  var options    = opts || {};
  var jsRegExp   = /js$/;
  var configPath = options.configPath || '';

  var srcTree;

  if (pkg['trees']) {
    return pkg['trees'];
  }

  var files = [ jsRegExp ];

  srcTree = new Funnel(options.srcPath || 'packages/' + packageName + '/src', {
    include: files,
    destDir: packageName,
    getDestinationPath: function(relativePath) {

      if (relativePath === 'index.js') {
        return '../' + packageName + '.js';
      }

      return relativePath;
    },
  });

  var srcJSHintTree = jshintTree(srcTree);

  var testTree = new Funnel(options.testPath || 'packages/' + packageName + '/tests', {
    include: [ jsRegExp ],
    destDir: '/' + packageName + '/tests'
  });

  var testJSHintTree = jshintTree(testTree);

  /*
    Merge jshint into testTree in order to ensure that if you have a jshint
    failure you'll see them fail in your browser tests
  */
  var testTrees = [];

  // if (!disableJSHint) {
  //   testTrees.push(srcJSHintTree);
  //   testTrees.push(testJSHintTree);
  // }

  testTrees.push(testTree);
  testTrees = testTrees.length > 0 ? mergeTrees(testTrees, { overwrite: true }) : testTree;

  // Memoizes trees. Guard above ensures that if this is set will automatically return.
  pkg['trees'] = {
    src : srcTree
  };

  // tests go boom if you try to pick them and they don't exists
  if (!pkg.skipTests) {
    pkg['trees'].tests = testTrees;
  }

  // Baboom!!  Return the trees.
  return pkg['trees'];
}