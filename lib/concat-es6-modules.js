const concat = require('broccoli-concat');
const mergeTrees = require('broccoli-merge-trees');
const merge = require('lodash/assign');
const transpileES6 = require('./transpile-es6');

const iifeStart = '(function() {';
const iifeStop = '})();';

const defaultOptions = {
  inputFiles: ['**/*.js']
};

function isArray(arr) {
  return Object.prototype.toString.call(arr) === "[object Array]";
}

module.exports = function concatES6Modules(inputTrees, options) {

  const mergedOptions = merge({}, defaultOptions, (options || {}));
  const loader = 'packages/loader/src';
  const inputFiles = mergedOptions.inputFiles;
  const destFile = mergedOptions.destFile;

  var sourceTrees;

  if (isArray(inputTrees)) {
    sourceTrees = mergeTrees(inputTrees, {overwrite: true});
  } else {
    sourceTrees = inputTrees;
  }

  sourceTrees = transpileES6(sourceTrees);

  const concatTrees = [loader, sourceTrees];
  const concatOptions =
    { sourceMapConfig: { enabled: !!options.enableSourceMaps }
    , inputFiles: inputFiles
    , outputFile: destFile
    , header: iifeStart
    , headerFiles: ['loader.js']
    , footer: iifeStop
    , allowNone: true
    , description: 'Concat ES6: ' + destFile
    };

  if (mergedOptions.bootstrapModule) {
    const contents = `require("${mergedOptions.bootstrapModule}");`;
    concatOptions.footer = `${contents}\n${iifeStop}`;
  }

  const concattedES6 =
    concat(mergeTrees(concatTrees), concatOptions);

  if (mergedOptions.derequire && !disableDerequire) {
    concattedES6 = derequire(concattedES6);
  }

  return concattedES6;
};
