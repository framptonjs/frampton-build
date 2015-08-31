'use strict';

var mergeTrees       = require('broccoli-merge-trees');
var concatES6Modules = require('./concat-es6-modules');
var uglify           = require('./uglify-source-tree');
var getPackage       = require('./get-package');

function FramptonBuild(options) {

  this._name = options.name || 'frampton';
  this._packages = options.packages;

  this._trees = {
    buildTree         : null,
    distTrees         : null,
    compiledTests     : null,
    compiledSource    : null
  };

  this._trees.distTrees = [
    this._generateCompiledSourceTree,
    this._generateCompiledTestsTree,
    this._generateMinifiedCompiledSourceTree
  ];
};

FramptonBuild.prototype._enumeratePackages = function() {

  if (this.buildTree) {
    return this.buildTree;
  }

  var packages       = this._packages;
  var testTrees      = [];
  var sourceTrees    = [];
  var packageName    = null;
  var currentPackage = null;

  for (packageName in packages) {

    currentPackage = packages[packageName];
    currentPackage.trees = getPackage(packages, packageName);

    if (currentPackage.trees.src) {
      sourceTrees.push(currentPackage.trees.src);
    }

    if (currentPackage.trees.tests) {
      testTrees.push(currentPackage.trees.tests);
    }
  }

  this.buildTree = {
    testTree   : mergeTrees(testTrees),
    sourceTree : mergeTrees(sourceTrees)
  };

  return this.buildTree;
};

FramptonBuild.prototype._generateCompiledSourceTree = function() {
  var buildTree = this._enumeratePackages();
  return this._trees.compiledSource = concatES6Modules(buildTree.sourceTree, {
    destFile        : '/' + this._name + '.js',
    bootstrapModule : this._name,
    includeShim     : true
  });
};

FramptonBuild.prototype._generateCompiledTestsTree = function() {
  var buildTree = this._enumeratePackages();
  return this._trees.compiledTests = concatES6Modules(buildTree.testTree, {
    destFile : '/' + this._name + '-tests.js'
  });
};

FramptonBuild.prototype._generateMinifiedCompiledSourceTree = function() {
  return this._trees.minifiedSource = uglify(this._trees.compiledSource, {
    srcFile  : this._name + '.js',
    destFile : this._name + '.min.js',
    mangle   : true,
    compress : true
  });
};

FramptonBuild.prototype.getDistTree = function() {

  var distTrees = [];
  var len       = this._trees.distTrees.length;
  var i         = 0;

  for (; i < len; i++) {
    distTrees.push(
      this._trees.distTrees[i].call(this)
    );
  }

  distTrees = mergeTrees(distTrees);

  return distTrees;
};

module.exports = FramptonBuild;