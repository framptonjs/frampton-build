// to avoid circular dependency shenanigans
module.exports = getPackage;

const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const jshintTree = require('broccoli-jshint');
const path = require('path');

const hintOptions = {
  disableTestGenerator : true
};

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
    include: files,
    destDir: packageName,
    getDestinationPath: function(relativePath) {
      if (relativePath === 'index.js') {
        return '../' + packageName + '.js';
      }
      return relativePath;
    },
  });

  const srcJSHintTree = jshintTree(srcTree, hintOptions);

  const testTree = new Funnel(options.testPath || 'packages/' + packageName + '/tests', {
    include: [ jsRegExp ],
    destDir: '/' + packageName + '/tests'
  });

  const testJSHintTree = jshintTree(testTree, hintOptions);

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
