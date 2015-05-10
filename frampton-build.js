var mergeTrees     = require('broccoli-merge-trees');
var framptonConcat = require('./frampton-concat');
var packages       = require('./packages');
var getPackage     = require('./get-package');

function FramptonBuild(options) {
  this._name = 'frampton';
  this._trees = {};
  this._trees.distTrees = [
    this._generateCompiledSourceTree
  ];
};

FramptonBuild.prototype._generateCompiledSourceTree = function() {

  var buildTree = this._enumeratePackages();

  var compiledSource = framptonConcat(buildTree.devSourceTrees, {
    destFile        : '/' + this._name + '.js',
    includeLoader   : true,
    bootstrapModule : this._name
  });

  return compiledSource;
};

FramptonBuild.prototype._enumeratePackages = function() {

  if (this.buildTree) {
    return this.buildTree;
  }

  var testTrees          = [];
  var devSourceTrees     = [];
  var prodSourceTrees    = [];
  var testingSourceTrees = [];

  for (var packageName in packages) {

    var currentPackage = packages[packageName];

    currentPackage.trees = getPackage(packages, packageName);

    if (currentPackage.trees.src) {
      devSourceTrees.push(currentPackage.trees.src);

      if (currentPackage.testing) {
        testingSourceTrees.push(currentPackage.trees.src);
      } else {
        prodSourceTrees.push(currentPackage.trees.src);
      }
    }

    if (currentPackage.trees.tests) {
      testTrees.push(currentPackage.trees.tests);
    }
  }

  this.buildTree = {
    testTree           : mergeTrees(testTrees),
    devSourceTrees     : mergeTrees(devSourceTrees),
    testingSourceTrees : testingSourceTrees,
    prodSourceTrees    : prodSourceTrees
  };

  return this.buildTree;
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

  // merge distTrees and sub out version placeholders for distribution
  distTrees = mergeTrees(distTrees);

  return distTrees;
};

module.exports = FramptonBuild;