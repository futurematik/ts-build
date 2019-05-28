const minimist = require('minimist');

module.exports = function splitArgs(args) {
  const { _: argv, ...tsBuildFlags } = minimist(args, { stopEarly: true });
  const packages = argv.filter(x => !x.startsWith('-'));
  const tscArgs = argv.filter(x => x.startsWith('-'));

  if (packages.length === 0) {
    return;
  }
  return { packages, tscArgs, tsBuildFlags };
};
