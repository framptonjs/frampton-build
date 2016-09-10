// to avoid circular dependency shenanigans
module.exports = getPackage;

const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const jshintTree = require('broccoli-jshint');
const path = require('path');
const fs = require('fs');

const hintOptions = {
  disableTestGenerator : true
};

function exists(path) {
  try {
    const stats = fs.lstatSync(path);
    return stats.isDirectory();
  } catch(e) {
    return false;
  }
}

function getPackage(packages, packageName, opts) {

  const pkg = packages[packageName];
  const options = opts || {};
  const disableJSHint = options.disableJSHint || false;
  const jsRegExp = /js$/;

  if (pkg.trees) {
    return pkg.trees;
  }

  const files = [ jsRegExp ];

  const srcPath = (options.srcPath || 'packages/' + packageName + '/src');
  const srcTree = new Funnel(srcPath, {
    include : files,
    destDir : packageName,
    allowEmpty : true,
    getDestinationPath : function(relativePath) {
      if (relativePath === 'index.js') {
        return '../' + packageName + '.js';
      }
      return relativePath;
    },
  });

  const srcJSHintTree = jshintTree(srcTree, hintOptions);
  const testPath = options.testPath || 'packages/' + packageName + '/tests';
  var testTree = null;

  if (exists(testPath)) {
    testTree = new Funnel(testPath, {
      include : [ jsRegExp ],
      destDir : '/' + packageName + '/tests',
      allowEmpty : true
    });
  }

  // Merge jshint test with browser tests.
  var testTrees = [];

  if (!disableJSHint) {
    testTrees.push(srcJSHintTree);
  }

  if (testTree !== null) {
    testTrees.push(testTree);
  }

  testTrees = testTrees.length > 0 ? mergeTrees(testTrees, { overwrite: true }) : testTree;

  pkg.trees = {
    src : srcTree
  };

  if (!pkg.skipTests) {
    pkg.trees.tests = testTrees;
  }

  return pkg.trees;
}
