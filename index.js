#!/usr/bin/env node

const splitArgs = require('./splitArgs');
const main = require('./main');

const usage = `
USAGE
  ts-build [ts-build-options] <folders...> [tsc-options...]

ARGUMENTS
  ts-build-options
    -d, --define name=value   Define a constant that will be inserted into the
                              build when ts-build is run.

    -e, --env    name1,name2  Copy the given environment variables to the build
                              constants file.

  folders
    A list of folders containing typescript packages. Each folder must either
    contain a package.json, or contain folders which contain package.json files.

  tsc-options
    Options to pass to tsc.


BUILD CONSTANTS

Build constants can be defined using the \`-d\` or \`--define\` options. The
argument for the option should be \`key=value\` format. The program will output 
a file called \`constants.build.json\` in the root of each package, which can
be added to the gitignore.`;

const args = splitArgs(process.argv.slice(2));

if (!args) {
  console.log(usage);
  process.exit(2);
}

main(args.tsBuildFlags, args.packages, args.tscArgs).catch(e => {
  console.error(e.toString());
  process.exit(1);
});
