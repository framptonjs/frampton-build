'use strict';

// to avoid circular dependency shenanigans
module.exports = getPackage;

var Funnel     = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');
var jshintTree = require('broccoli-jshint');
var path       = require('path');

var hintOptions = {
  disableTestGenerator : true
}

function getPackage(packages, packageName, opts) {

  var pkg           = packages[packageName];
  var options       = opts || {};
  var disableJSHint = options.disableJSHint || false;
  var jsRegExp      = /js$/;

  var srcTree;

  if (pkg.trees) {
    return pkg.trees;
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

  var srcJSHintTree = jshintTree(srcTree, hintOptions);

  var testTree = new Funnel(options.testPath || 'packages/' + packageName + '/tests', {
    include: [ jsRegExp ],
    destDir: '/' + packageName + '/tests'
  });

  var testJSHintTree = jshintTree(testTree, hintOptions);

  // Merge jshint test with browser tests.
  var testTrees = [];

  if (!disableJSHint) {
    testTrees.push(srcJSHintTree);
    testTrees.push(testJSHintTree);
  }

  testTrees.push(testTree);
  testTrees = testTrees.length > 0 ? mergeTrees(testTrees, { overwrite: true }) : testTree;

  pkg.trees = {
    src : srcTree
  };

  if (!pkg.skipTests) {
    pkg.trees.tests = testTrees;
  }

  return pkg.trees;
}