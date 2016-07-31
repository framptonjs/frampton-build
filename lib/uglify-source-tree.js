const uglify = require('broccoli-uglify-js');
const Funnel = require('broccoli-funnel');

module.exports = function uglifySourceTree(tree, options) {

  const uglifyTree = new Funnel(tree, {
    files: [options.srcFile],
    getDestinationPath: function(relativePath) {
      if (relativePath === options.srcFile) {
        return options.destFile;
      } else {
        return relativePath;
      }
    }
  });

  return uglify(uglifyTree, {
    mangle : options.mangle,
    compress : options.compress
  });
};
