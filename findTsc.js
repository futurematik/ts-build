const path = require('path');
const fs = require('fs');

module.exports = function findTsc() {
  try {
    let tscPath = require.resolve('typescript', { paths: [process.cwd()] });
    const search = 'node_modules/';

    const i = tscPath.lastIndexOf(search);
    if (i < 0) {
      return 'tsc';
    }

    tscPath = path.join(tscPath.substring(0, i + search.length), '.bin/tsc');

    // this will throw if it doesn't exist
    fs.statSync(tscPath);
    return tscPath;
  } catch (e) {
    // fallback to hoping it's in the path
    return 'tsc';
  }
};
